"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { categoryName, money, type Product } from "@/lib/products";
import { api } from "@/lib/client-api";

export default function CartPage() {
  const cart=useCart();
  const [products,setProducts]=useState<Product[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [revision,setRevision]=useState(0);
  const [message,setMessage]=useState("");
  const ids=cart.items.map(item=>item.id).filter(id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)).sort().join(",");
  useEffect(()=>{
    const controller=new AbortController();
    async function load() {
      setLoading(true);setError("");
      try { const products=await api<Product[]>(`/api/products/by-ids?ids=${encodeURIComponent(ids)}`,{signal:controller.signal});if(!controller.signal.aborted)setProducts(products); }
      catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:"Não foi possível atualizar os produtos.");}
      finally{if(!controller.signal.aborted)setLoading(false);}
    }
    if(cart.ready)void load();
    return()=>controller.abort();
  },[ids,cart.ready,revision]);
  const rows=cart.items.map(item=>({item,product:products.find(product=>product.id===item.id)}));
  const subtotal=rows.reduce((sum,row)=>sum+(row.product?.price||0)*row.item.quantity,0);
  const shipping=subtotal>=250?0:22.9;
  const invalid=rows.some(row=>!row.product||row.item.quantity>row.product.stock);
  function finish(){cart.clear();setMessage("Carrinho de demonstração concluído. Nenhum pedido ou pagamento foi registrado.");}

  return <><section className="cabecalho-pagina"><div className="container"><span className="rotulo">Sua seleção</span><h1>Carrinho de compras</h1></div></section>
    <section className="secao secao-carrinho"><div className="container carrinho-layout">
      {!cart.ready||loading ? <p role="status">Atualizando os produtos do carrinho…</p> : error ? <div className="cart-status" role="alert">{error} <button onClick={()=>setRevision(value=>value+1)}>Tentar novamente</button></div> : !rows.length ? <div className="carrinho-vazio carrinho-largura-total">{message&&<p role="status">{message}</p>}<h3>Seu carrinho está vazio</h3><p>Explore nosso catálogo e adicione os produtos que desejar.</p><Link href="/produtos" className="btn btn-primario">Ver produtos</Link></div> : <>
        <div className="lista-carrinho">{rows.map(({item,product})=>product ? <article className="item-carrinho" key={item.id}>
          <div className="item-carrinho-imagem"><Image src={product.image} alt={product.name} width={110} height={110}/></div>
          <div><Link href={`/produto/${product.id}`} className="item-carrinho-nome">{product.name}</Link><div className="item-carrinho-cat">{categoryName(product.category)}</div>
            {item.quantity>product.stock&&<p role="status">{product.stock ? `Ajuste a quantidade: restam ${product.stock} unidades.` : "Produto esgotado."}</p>}
            <div className="item-carrinho-qty"><button className="qty-btn" onClick={()=>item.quantity<=1?cart.remove(item.id):cart.setQuantity(item.id,item.quantity-1)} aria-label={`Diminuir quantidade de ${product.name}`}>−</button><span aria-live="polite">{item.quantity}</span><button className="qty-btn" disabled={item.quantity>=product.stock} onClick={()=>cart.setQuantity(item.id,item.quantity+1)} aria-label={`Aumentar quantidade de ${product.name}`}>+</button></div>
            <button className="item-remover" onClick={()=>cart.remove(item.id)}>Remover</button>
          </div><div className="item-carrinho-preco">{money(product.price*item.quantity)}</div>
        </article> : <div className="cart-status" key={item.id}>Este produto não está mais disponível. <button onClick={()=>cart.remove(item.id)}>Remover do carrinho</button></div>)}<Link href="/produtos" className="continuar-comprando">← Continuar comprando</Link></div>
        <aside className="resumo-pedido"><h3>Resumo do pedido</h3><div className="resumo-linha"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="resumo-linha"><span>Frete estimado</span><strong>{shipping===0?"Grátis":money(shipping)}</strong></div><div className="resumo-total"><span>Total estimado</span><span className="preco-atual">{money(subtotal+shipping)}</span></div><button className="btn btn-primario btn-bloco" onClick={finish} disabled={invalid}>Finalizar demonstração</button><button className="btn btn-contorno btn-bloco btn-limpar" onClick={()=>{if(confirm("Deseja remover todos os produtos do carrinho?"))cart.clear();}}>Limpar carrinho</button><small className="nota-checkout">O checkout ainda é demonstrativo. Nenhum pedido ou pagamento será registrado.</small></aside>
      </>}
    </div></section>
  </>;
}
