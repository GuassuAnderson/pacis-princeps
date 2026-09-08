import { z } from "zod";
import { getProductsByIds } from "@/lib/server/catalog";
import { apiError, json } from "@/lib/server/http";
export async function GET(request: Request) {
  try {
    const ids=z.array(z.uuid()).max(50).parse((new URL(request.url).searchParams.get("ids")||"").split(",").filter(Boolean));
    return json(await getProductsByIds([...new Set(ids)]));
  } catch(error) {return apiError(error, "Não foi possível atualizar os produtos do carrinho. Tente novamente em instantes.");}
}
