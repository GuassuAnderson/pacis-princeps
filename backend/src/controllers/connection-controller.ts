import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase";

const photoSchema = z.string().max(7_000_000).refine(
  value => /^https:\/\//i.test(value) || /^data:image\/(?:jpeg|png|webp);base64,/i.test(value),
  "Foto inválida.",
);

const connectionFields = z.object({
  title: z.string().trim().min(2).max(180),
  theme: z.string().trim().min(2).max(160),
  eventDate: z.iso.date(),
  preacher: z.string().trim().min(2).max(160),
  preacherTitle: z.string().trim().max(160).nullable().optional(),
  summary: z.string().trim().min(10).max(600),
  content: z.string().trim().max(30_000).nullable().optional(),
  published: z.boolean().optional(),
  photos: z.array(photoSchema).max(8).optional(),
});

const createSchema = connectionFields;
const updateSchema = connectionFields.partial();
const selectFields = "*, photos:connection_images(id, image_url, position)";

export async function listPublishedConnections(_req: Request, res: Response): Promise<void> {
  const { data, error } = await supabase.from("connections").select(selectFields)
    .eq("active", true).eq("published", true).order("event_date", { ascending: false })
    .order("position", { foreignTable: "connection_images", ascending: true });
  if (error) throw error;
  res.json(data);
}

export async function listAdminConnections(_req: Request, res: Response): Promise<void> {
  const { data, error } = await supabase.from("connections").select(selectFields)
    .eq("active", true).order("event_date", { ascending: false })
    .order("position", { foreignTable: "connection_images", ascending: true });
  if (error) throw error;
  res.json(data);
}

export async function createConnection(req: Request, res: Response): Promise<void> {
  const input = createSchema.parse(req.body);
  const { photos = [], ...fields } = input;
  const { data: connection, error } = await supabase.from("connections")
    .insert(toDatabase(fields)).select("*").single();
  if (error) throw error;
  try {
    await replacePhotos(connection.id, photos);
  } catch (uploadError) {
    await supabase.from("connections").delete().eq("id", connection.id);
    throw uploadError;
  }
  const saved = await getConnection(connection.id);
  res.status(201).json(saved);
}

export async function updateConnection(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const input = updateSchema.parse(req.body);
  const { photos, ...fields } = input;
  const { data, error } = await supabase.from("connections").update(toDatabase(fields))
    .eq("id", id).eq("active", true).select("id").maybeSingle();
  if (error) throw error;
  if (!data) { res.status(404).json({ message: "Conexão não encontrada." }); return; }
  if (photos) await replacePhotos(id, photos);
  res.json(await getConnection(id));
}

export async function deleteConnection(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const { data, error } = await supabase.from("connections").update({ active: false })
    .eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  if (!data) { res.status(404).json({ message: "Conexão não encontrada." }); return; }
  res.status(204).send();
}

async function getConnection(id: string) {
  const { data, error } = await supabase.from("connections").select(selectFields).eq("id", id)
    .order("position", { foreignTable: "connection_images", ascending: true }).single();
  if (error) throw error;
  return data;
}

function toDatabase(data: Record<string, unknown>) {
  const map: Record<string, string> = { eventDate: "event_date", preacherTitle: "preacher_title" };
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)
    .map(([key, value]) => [map[key] || key, value]));
}

async function replacePhotos(connectionId: string, photos: string[]) {
  const uploaded = await Promise.all(photos.map(async (photo, position) => ({
    connection_id: connectionId,
    image_url: photo.startsWith("data:") ? await uploadPhoto(photo) : photo,
    position,
  })));
  const { error: deleteError } = await supabase.from("connection_images").delete().eq("connection_id", connectionId);
  if (deleteError) throw deleteError;
  if (uploaded.length) {
    const { error } = await supabase.from("connection_images").insert(uploaded);
    if (error) throw error;
  }
}

async function uploadPhoto(dataUrl: string): Promise<string> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Formato de foto inválido.");
  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error("Cada foto deve ter no máximo 5 MB.");
  const { data: bucket } = await supabase.storage.getBucket("connection-images");
  if (!bucket) {
    const { error } = await supabase.storage.createBucket("connection-images", {
      public: true, fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("connection-images").upload(path, buffer, {
    contentType, cacheControl: "31536000", upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("connection-images").getPublicUrl(path).data.publicUrl;
}
