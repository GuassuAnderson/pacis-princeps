import "server-only";
import { revalidatePath } from "next/cache";
export function revalidateCatalog(id: string) {
  for (const path of ["/", "/produtos", "/admin", "/admin/produtos", "/carrinho", `/produto/${id}`]) revalidatePath(path);
}
