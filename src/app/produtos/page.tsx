import { Catalog } from "@/components/catalog";
import { HeroProductCarousel } from "@/components/hero-product-carousel";
import { listProducts } from "@/lib/server/catalog";
import { productQuery } from "@/lib/product-validation";
import type { ProductList } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Products({ searchParams }: { searchParams: Promise<{ categoria?: string; ordem?: string; busca?: string; pagina?: string }> }) {
  const params = await searchParams;
  const parsed = productQuery.safeParse({ category: params.categoria, sort: params.ordem, search: params.busca, page: params.pagina });
  const query = parsed.success ? parsed.data : productQuery.parse({});
  let result: ProductList = { items: [], total: 0, page: query.page, limit: query.limit };
  let heroProducts: ProductList["items"] = [];
  let error = false;
  const [catalogResult, heroResult] = await Promise.allSettled([
    listProducts(query),
    listProducts({ inHero: "true", limit: 5 }),
  ]);
  if (catalogResult.status === "fulfilled") result = catalogResult.value;
  else error = true;
  if (heroResult.status === "fulfilled") heroProducts = heroResult.value.items;

  return <>
    <section className="cabecalho-pagina catalogo-hero">
      <div className="catalogo-hero-linhas" aria-hidden="true" />
      <div className="container catalogo-hero-conteudo">
        <div className="catalogo-hero-texto">
          <span className="rotulo">Curadoria Pacis Princeps</span>
          <h1>Artigos que aproximam o coração da <em>fé</em></h1>
          <p>Uma seleção feita com cuidado para acompanhar sua oração, presentear quem você ama e tornar a devoção presente no dia a dia.</p>
          <div className="catalogo-hero-notas" aria-label="Diferenciais do catálogo"><span>✦ Escolha cuidadosa</span><span>✦ Propósito em cada peça</span></div>
        </div>
        <div className="catalogo-hero-visual"><HeroProductCarousel products={heroProducts} /></div>
      </div>
    </section>
    <Catalog result={result} category={query.category} sort={query.sort} search={query.search} error={error} />
  </>;
}
