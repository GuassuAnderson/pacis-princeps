import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { supabase } from "../lib/supabase";

const productSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().trim().min(10),
    price: z.coerce.number().positive(),
    compareAtPrice: z.coerce.number().positive().nullable().optional(),
    stock: z.coerce.number().int().min(0),
    imageUrl: z.string().url().nullable().optional(),
    featured: z.boolean().optional(),
    active: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
    categorySlug: z.string().trim().min(2).max(100).optional(),
    imageData: z.string().max(7_000_000).optional(),
  })
  .refine((data) => Boolean(data.categoryId || data.categorySlug), {
    path: ["categorySlug"], message: "Informe a categoria do produto.",
  })
  .refine(
    (data) => data.compareAtPrice == null || data.compareAtPrice > data.price,
    { path: ["compareAtPrice"], message: "O preço anterior deve ser maior que o preço atual." },
  );

const updateProductSchema = productSchema.partial();

export async function listProducts(req: Request, res: Response): Promise<void> {
  const query = z
    .object({
      category: z.string().optional(),
      featured: z.enum(["true", "false"]).optional(),
      search: z.string().trim().optional(),
    })
    .parse(req.query);

  let request = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (query.featured) request = request.eq("featured", query.featured === "true");
  if (query.category) request = request.eq("categories.slug", query.category);
  if (query.search) request = request.ilike("name", `%${query.search}%`);

  const { data: products, error } = await request;
  if (error) throw error;

  res.json(products);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const { data: product, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;

  if (!product) {
    res.status(404).json({ message: "Produto não encontrado." });
    return;
  }

  res.json(product);
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const data = productSchema.parse(req.body);
  const categoryId = await resolveCategoryId(data.categoryId, data.categorySlug);
  const imageUrl = data.imageData ? await uploadProductImage(data.imageData) : data.imageUrl;
  const databaseProduct = toDatabaseProduct({ ...data, categoryId, imageUrl });
  const { data: product, error } = await supabase
    .from("products")
    .insert(databaseProduct)
    .select("*, category:categories(*)")
    .single();

  if (error) throw error;

  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const data = updateProductSchema.parse(req.body);
  const categoryId = data.categoryId || data.categorySlug
    ? await resolveCategoryId(data.categoryId, data.categorySlug)
    : undefined;
  const imageUrl = data.imageData ? await uploadProductImage(data.imageData) : data.imageUrl;
  const { data: product, error } = await supabase
    .from("products")
    .update(toDatabaseProduct({ ...data, categoryId, imageUrl }))
    .eq("id", id)
    .select("*, category:categories(*)")
    .maybeSingle();

  if (error) throw error;
  if (!product) {
    res.status(404).json({ message: "Produto não encontrado." });
    return;
  }

  res.json(product);
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const { data: product, error } = await supabase
    .from("products")
    .update({ active: false })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!product) {
    res.status(404).json({ message: "Produto não encontrado." });
    return;
  }
  res.status(204).send();
}

function toDatabaseProduct(data: Record<string, unknown>): Record<string, unknown> {
  const fieldMap: Record<string, string> = {
    compareAtPrice: "compare_at_price",
    imageUrl: "image_url",
    categoryId: "category_id",
  };

  return Object.fromEntries(Object.entries(data)
    .filter(([key, value]) => value !== undefined && key !== "categorySlug" && key !== "imageData")
    .map(([key, value]) => [fieldMap[key] ?? key, value]));
}

async function resolveCategoryId(categoryId?: string, categorySlug?: string): Promise<string> {
  if (categoryId) return categoryId;
  const { data: category, error } = await supabase
    .from("categories").select("id").eq("slug", categorySlug!).eq("active", true).maybeSingle();
  if (error) throw error;
  if (category) return category.id;
  const categoryNames: Record<string, string> = {
    tercos: "Terços", imagens: "Imagens Sacras", camisetas: "Camisetas", joias: "Joias",
    mandalas: "Mandalas", crucifixos: "Crucifixos", velas: "Velas",
    "oficial-pacis": "Oficial PACIS", diverso: "Diverso",
  };
  const name = categoryNames[categorySlug!];
  if (!name) throw new Error("Categoria inválida.");
  const { data: createdCategory, error: createError } = await supabase
    .from("categories").upsert({ name, slug: categorySlug, active: true }, { onConflict: "slug" })
    .select("id").single();
  if (createError) throw createError;
  return createdCategory.id;
}

async function uploadProductImage(imageData: string): Promise<string> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(imageData);
  if (!match) throw new Error("Formato de imagem inválido.");
  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 5 MB.");
  const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
  const { data: bucket } = await supabase.storage.getBucket("product-images");
  if (!bucket) {
    const { error: bucketError } = await supabase.storage.createBucket("product-images", {
      public: true, fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (bucketError && !/already exists/i.test(bucketError.message)) throw bucketError;
  }
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("product-images").upload(path, buffer, {
    contentType, cacheControl: "31536000", upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
