import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { categoryName, money } from "@/lib/products";
import { getProduct, listProducts } from "@/lib/server/catalog";
import { Purchase } from "./purchase";

export const dynamic = "force-dynamic";
type Props = { params:Promise<{id:string}> };
export async function generateMetadata({params}:Props):Promise<Metadata> {
  try { const product=await getProduct((await params).id); return {title:product?.name || "Produto não encontrado",description:product?.description.slice(0,160)}; }
  catch { return {title:"Produto"}; }
}
export default async function ProductPage({params}:Props) {
  const product=await getProduct((await params).id);
  if (!product) notFound();
  const related=(await listProducts({category:product.category,limit:5})).items.filter(item=>item.id!==product.id).slice(0,4);
  return <>
    <div className="container"><div className="produto-detalhe">
      <ProductGallery key={product.updatedAt} images={product.images} name={product.name} cover={product.image}/>
      <div className="produto-info"><Link href="/produtos" className="produto-voltar">← Voltar ao catálogo</Link><span className="rotulo">{categoryName(product.category)}</span><h1>{product.name}</h1>
        <div className="produto-preco-bloco"><span className="preco-atual">{money(product.price)}</span>{product.oldPrice ? <span className="preco-antigo">{money(product.oldPrice)}</span> : null}</div>
        <p className="produto-descricao" style={{whiteSpace:"pre-line"}}>{product.description}</p>
        <Purchase id={product.id} soldOut={product.stock<1}/>
        <div className="produto-meta"><dl><dt>Categoria</dt><dd>{categoryName(product.category)}</dd><dt>Estoque</dt><dd>{product.stock>0 ? `${product.stock} unidades disponíveis` : "Produto esgotado"}</dd></dl></div>
      </div>
    </div></div>
    {related.length>0 && <section className="secao" style={{background:"var(--areia-clara)",marginTop:40,padding:"60px 0"}}><div className="container"><div className="secao-cabecalho"><div><span className="rotulo">Você também pode gostar</span><h2>Outros produtos</h2></div></div><div className="grade-produtos">{related.map(item=><ProductCard key={item.id} product={item}/>)}</div></div></section>}
  </>;
}
