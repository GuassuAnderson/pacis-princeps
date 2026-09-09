import { randomUUID } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { requireAdmin } from "@/lib/server/auth";
import { database } from "@/lib/server/database";
import { apiError, checkOrigin, HttpError, json, limitedBody } from "@/lib/server/http";
import { CONNECTION_BUCKET } from '@/lib/server/connections';
import { MAX_IMAGE_BYTES } from "@/lib/product-validation";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const admin = await requireAdmin();
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data;")) throw new HttpError(415,"Selecione uma foto JPG, PNG ou WebP.");
    const body = await limitedBody(request, MAX_IMAGE_BYTES + 65536);
    let form: FormData;
    try { form = await new Response(new Uint8Array(body), { headers: { "content-type": contentType } }).formData(); }
    catch { throw new HttpError(400,"Não foi possível ler a foto enviada."); }
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_IMAGE_BYTES) throw new HttpError(400,"Envie uma foto de até 4 MB.");
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) throw new HttpError(415,"Use JPG, PNG ou WebP.");
    let output: { data: Buffer; info: OutputInfo };
    try {
      const original = Buffer.from(await file.arrayBuffer());
      const metadata = await sharp(original, { limitInputPixels: 25000000 }).metadata();
      if (!["jpeg","png","webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1) throw new Error("Unsupported image");
      output = await sharp(original, { limitInputPixels: 25000000 }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer({ resolveWithObject: true });
    } catch { throw new HttpError(400,"Foto inválida. Use uma imagem estática JPG, PNG ou WebP de até 25 megapixels."); }
    const db = database();
    const id = randomUUID();
    const path = `${admin.id}/${id}.webp`;
    const { error: uploadError } = await db.storage.from(CONNECTION_BUCKET).upload(path, output.data, { contentType:"image/webp", cacheControl:"31536000", upsert:false });
    if (uploadError) throw uploadError;
    const { error } = await db.from("connection_assets").insert({ id, uploaded_by:admin.id, storage_path:path, width:output.info.width, height:output.info.height, bytes:output.info.size });
    if (error) { await db.storage.from(CONNECTION_BUCKET).remove([path]); throw error; }
    return json({ id, url:db.storage.from(CONNECTION_BUCKET).getPublicUrl(path).data.publicUrl, alt:"", width:output.info.width, height:output.info.height },201);
  } catch (error) { return apiError(error); }
}
