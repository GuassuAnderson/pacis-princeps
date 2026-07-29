import { Request, Response } from "express";
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
    categoryId: z.string().uuid(),
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
  const { data: product, error } = await supabase
    .from("products")
    .insert(toDatabaseProduct(data))
    .select("*, category:categories(*)")
    .single();

  if (error) throw error;

  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const data = updateProductSchema.parse(req.body);
  const { data: product, error } = await supabase
    .from("products")
    .update(toDatabaseProduct(data))
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

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [fieldMap[key] ?? key, value]),
  );
}
