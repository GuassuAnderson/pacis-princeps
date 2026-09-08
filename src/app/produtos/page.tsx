import { Catalog } from "@/components/catalog";
import { listProducts } from "@/lib/server/catalog";
import { productQuery } from "@/lib/product-validation";
import type { ProductList } from "@/lib/products";
export const dynamic = "force-dynamic";
export default async function Products({searchParams}:{searchParams:Promise<{categoria?:string;ordem?:string;busca?:string;pagina?:string}>}) {
  const params = await searchParams;
  const parsed = productQuery.safeParse({category:params.categoria,sort:params.ordem,search:params.busca,page:params.pagina});
  const query = parsed.success ? parsed.data : productQuery.parse({});
  let result: ProductList = { items:[], total:0, page:query.page, limit:query.limit };
  let error = false;
  try { result = await listProducts(query); } catch { error = true; }
  return <><section className="cabecalho-pagina"><div className="container"><span className="rotulo">Catálogo</span><h1>Todos os produtos</h1><p>Peças para viver a sua fé — encontre o produto certo para você.</p></div></section><Catalog result={result} category={query.category} sort={query.sort} search={query.search} error={error}/></>;
}
