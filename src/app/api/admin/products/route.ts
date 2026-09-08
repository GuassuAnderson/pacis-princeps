import { requireAdmin } from "@/lib/server/auth";
import { listProducts, saveProduct } from "@/lib/server/catalog";
import { apiError, checkOrigin, json, readJson } from "@/lib/server/http";
import { productInput } from "@/lib/product-validation";
import { revalidateCatalog } from "@/lib/server/revalidate-catalog";
export async function GET(request: Request) {
  try { await requireAdmin(); return json(await listProducts(Object.fromEntries(new URL(request.url).searchParams), true)); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request); const admin = await requireAdmin(); const input = productInput.parse(await readJson(request));
    const product = await saveProduct(input, admin.id); revalidateCatalog(input.id);
    return json(product, input.updatedAt ? 200 : 201);
  } catch (error) { return apiError(error); }
}
