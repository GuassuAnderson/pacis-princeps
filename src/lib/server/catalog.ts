import "server-only";
import { z } from "zod";
import { database, PRODUCT_BUCKET } from "./database";
import { HttpError } from "./http";
import { productQuery, type ProductInput } from "../product-validation";
import { PRODUCT_PLACEHOLDER, type Product, type ProductImage, type ProductList } from "../products";

type ImageRow = { id: string; storage_path: string | null; external_url: string | null; alt: string; width: number | null; height: number | null; position: number; active: boolean };
type ProductRow = { id: string; name: string; description: string; price: number | string; compare_at_price: number | string | null; stock: number; featured: boolean; in_hero: boolean; active: boolean; updated_at: string; image_url: string | null; category: { slug: string }; images: ImageRow[] };
const select = "id,name,description,price,compare_at_price,stock,featured,in_hero,active,updated_at,image_url,category:categories!inner(slug),images:product_images(id,storage_path,external_url,alt,width,height,position,active)";

export function imageUrl(path: string) { return database().storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl; }

function safeLegacyUrl(value: string | null) {
  if (!value) return PRODUCT_PLACEHOLDER;
  try {
    const url = new URL(value);
    const configured = new URL(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
    const allowed = url.host === "placehold.co" || (url.host === configured && url.pathname.startsWith(`/storage/v1/object/public/${PRODUCT_BUCKET}/`));
    return url.protocol === "https:" && allowed ? value : PRODUCT_PLACEHOLDER;
  } catch { return PRODUCT_PLACEHOLDER; }
}

function mapProduct(row: ProductRow): Product {
  const images: ProductImage[] = (row.images || []).filter(image => image.active).sort((a,b) => a.position-b.position).map(image => ({
    id: image.id, url: image.storage_path ? imageUrl(image.storage_path) : safeLegacyUrl(image.external_url),
    alt: image.alt || row.name, width: image.width || 1000, height: image.height || 1000,
  }));
  return { id: row.id, name: row.name, description: row.description, category: row.category.slug,
    price: Number(row.price), oldPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    stock: row.stock, featured: row.featured, inHero: row.in_hero, active: row.active, updatedAt: row.updated_at,
    image: images[0]?.url || safeLegacyUrl(row.image_url), images };
}

export async function listProducts(input: unknown = {}, admin = false): Promise<ProductList> {
  const query = productQuery.parse(input);
  let request = database().from("products").select(select, { count: "exact" });
  if (!admin || query.status === "active") request = request.eq("active", true);
  if (admin && query.status === "inactive") request = request.eq("active", false);
  if (query.category && query.category !== "todas") request = request.eq("category.slug", query.category);
  if (query.inHero) request = request.eq("in_hero", query.inHero === "true");
  if (query.featured) request = request.eq("featured", query.featured === "true");
  if (query.search) request = request.ilike("name", `%${query.search.replace(/[\\%_]/g, "\\$&")}%`);
  const sort = query.sort === "nome" ? "name" : query.sort === "menor-preco" || query.sort === "maior-preco" ? "price" : "created_at";
  request = request.order(sort, { ascending: query.sort === "menor-preco" || query.sort === "nome" }).order("id", { ascending: true });
  const start = (query.page-1)*query.limit;
  const { data, count, error } = await request.range(start, start+query.limit-1);
  if (error) throw error;
  return { items: (data as unknown as ProductRow[]).map(mapProduct), total: count || 0, page: query.page, limit: query.limit };
}

export async function getProduct(id: string, admin = false): Promise<Product | null> {
  if (!z.uuid().safeParse(id).success) return null;
  let request = database().from("products").select(select).eq("id", id);
  if (!admin) request = request.eq("active", true);
  const { data, error } = await request.maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const { data, error } = await database().from("products").select(select).in("id", ids).eq("active", true);
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function saveProduct(input: ProductInput, actorId: string) {
  const { imageIds, ...payload } = input;
  const { data: id, error } = await database().rpc("save_catalog_product", { payload, image_ids: imageIds, actor_id: actorId });
  if (error) {
    if (error.code === "P0003") throw new HttpError(409, "O carrossel já tem 5 produtos. Desmarque um deles antes de adicionar outro.");
    if (error.code === "40001" || error.code === "23505") throw new HttpError(409, "Este produto foi alterado em outra aba. Recarregue a lista antes de editar novamente.");
    if (error.code === "22023" || error.code === "23514") throw new HttpError(400, "Confira a categoria, os preços e as imagens selecionadas.");
    if (error.code === "P0002") throw new HttpError(404, "Produto não encontrado.");
    throw error;
  }
  return getProduct(id as string, true);
}

export async function catalogMetrics() {
  const db = database();
  const { data, error } = await db.rpc("catalog_metrics");
  if (error) throw error;
  return data as { total: number; featured: number; stock: number; categories: number };
}
