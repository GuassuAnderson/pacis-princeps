import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { database } from "@/lib/server/database";
import { getProduct } from "@/lib/server/catalog";
import { apiError, checkOrigin, HttpError, json, readJson } from "@/lib/server/http";
import { revalidateCatalog } from "@/lib/server/revalidate-catalog";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const product = await getProduct((await context.params).id, true); if (!product) throw new HttpError(404,"Produto não encontrado."); return json(product); }
  catch (error) { return apiError(error); }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request); await requireAdmin(); const id = z.uuid().parse((await context.params).id);
    const { updatedAt } = z.object({ updatedAt: z.iso.datetime({ offset: true }) }).parse(await readJson(request));
    const { data, error } = await database().from("products").update({ active: false, featured: false, hero_slot: null }).eq("id", id).eq("updated_at", updatedAt).select("id").maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(409, "O produto mudou. Recarregue a lista antes de despublicar.");
    revalidateCatalog(id); return json({ ok: true });
  } catch (error) { return apiError(error); }
}
