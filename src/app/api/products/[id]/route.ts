import { getProduct } from "@/lib/server/catalog";
import { apiError, HttpError, json } from "@/lib/server/http";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { const product = await getProduct((await context.params).id); if (!product) throw new HttpError(404, "Produto não encontrado."); return json(product); }
  catch (error) { return apiError(error, "Não foi possível carregar o produto. Tente novamente em instantes."); }
}
