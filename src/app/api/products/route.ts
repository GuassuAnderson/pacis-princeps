import { listProducts } from "@/lib/server/catalog";
import { apiError, json } from "@/lib/server/http";
export async function GET(request: Request) {
  try { return json(await listProducts(Object.fromEntries(new URL(request.url).searchParams))); }
  catch (error) { return apiError(error, "Não foi possível carregar os produtos. Tente novamente em instantes."); }
}
