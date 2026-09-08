"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { categories, type ProductList } from "@/lib/products";
import { ProductCard } from "./product-card";

export function Catalog({ result, category="todas", sort="relevancia", search="", error=false }: { result:ProductList; category?:string; sort?:string; search?:string; error?:boolean }) {
  const router = useRouter();
  const [pending,startTransition] = useTransition();
  function href(values: Record<string,string>) {
    return `/produtos?${new URLSearchParams({categoria:category,ordem:sort,busca:search,pagina:"1",...values})}`;
  }
  return <section className="secao secao-catalogo"><div className="container catalogo-layout">
    <aside className="filtros" aria-label="Filtros de produtos">
      <div className="filtro-bloco"><h4>Categoria</h4><ul className="filtro-lista"><li><Link className={`filtro-item ${category==="todas" ? "ativo" : ""}`} href={href({categoria:"todas"})}>Todas as categorias</Link></li>{categories.map(item=><li key={item.id}><Link className={`filtro-item ${category===item.id ? "ativo" : ""}`} href={href({categoria:item.id})}>{item.name}</Link></li>)}</ul></div>
      <div className="filtro-bloco"><label htmlFor="catalog-sort"><h4>Ordenar por</h4></label><select id="catalog-sort" value={sort} disabled={pending} onChange={event=>startTransition(()=>router.push(href({ordem:event.target.value})))} className="filtro-select"><option value="relevancia">Mais recentes</option><option value="menor-preco">Menor preço</option><option value="maior-preco">Maior preço</option><option value="nome">Nome (A–Z)</option></select></div>
    </aside>
    <div className="catalogo-conteudo" aria-busy={pending}>
      <form action="/produtos" className="catalog-search"><input type="hidden" name="categoria" value={category}/><input type="hidden" name="ordem" value={sort}/><label htmlFor="catalog-search">Buscar produto</label><div><input key={search} id="catalog-search" name="busca" defaultValue={search} maxLength={160} placeholder="O que você procura?"/><button className="btn btn-contorno" type="submit">Buscar</button></div></form>
      <div className="catalogo-topo"><span className="catalogo-contagem">{error ? "Catálogo temporariamente indisponível" : `${result.total} produto${result.total!==1 ? "s" : ""} encontrado${result.total!==1 ? "s" : ""}`}</span></div>
      {error ? <div className="catalogo-vazio" role="alert"><p>Não foi possível carregar os produtos. Tente novamente em instantes.</p><button type="button" className="btn btn-contorno" onClick={()=>router.refresh()}>Tentar novamente</button></div> : result.items.length ? <div className="grade-produtos">{result.items.map(product=><ProductCard key={product.id} product={product}/>)}</div> : <div className="catalogo-vazio"><p>Nenhum produto encontrado nesta seleção.</p><Link href="/produtos" className="btn btn-contorno">Ver todos os produtos</Link></div>}
      {!error && result.total>result.limit && <nav className="catalog-pagination" aria-label="Páginas do catálogo">{result.page>1 && <Link className="btn btn-contorno" href={href({pagina:String(result.page-1)})}>Anterior</Link>}<span>Página {result.page} de {Math.ceil(result.total/result.limit)}</span>{result.page*result.limit<result.total && <Link className="btn btn-contorno" href={href({pagina:String(result.page+1)})}>Próxima</Link>}</nav>}
    </div>
  </div></section>;
}
