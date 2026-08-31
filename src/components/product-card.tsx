"use client";
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {categoryName,money,Product} from "@/lib/products";
import {useCart} from "./cart-provider";

export function ProductCard({product}:{product:Product}){
  const {add}=useCart();
  const [feedback,setFeedback]=useState(false);
  const soldOut=product.stock<1;
  function addToCart(){if(soldOut)return;add(product.id);setFeedback(true);window.setTimeout(()=>setFeedback(false),1800)}
  return <article className="cartao-produto">
    <Link href={`/produto/${product.id}`} className="cartao-produto-imagem">
      {product.oldPrice?<span className="selo-produto">Oferta</span>:null}
      {soldOut?<span className="selo-produto selo-esgotado">Esgotado</span>:null}
      <Image src={product.image} alt={product.name} width={600} height={600}/>
    </Link>
    <div className="cartao-produto-corpo"><span className="rotulo">{categoryName(product.category)}</span><Link href={`/produto/${product.id}`}><h3>{product.name}</h3></Link><div className="cartao-produto-preco"><span className="preco-atual">{money(product.price)}</span>{product.oldPrice?<span className="preco-antigo">{money(product.oldPrice)}</span>:null}</div></div>
    <div className="cartao-produto-acoes"><button className="btn btn-primario btn-bloco" type="button" onClick={addToCart} disabled={soldOut||feedback}>{soldOut?"Produto esgotado":feedback?"Adicionado ✓":"Adicionar ao carrinho"}</button></div>
  </article>;
}
