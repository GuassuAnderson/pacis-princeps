"use client";
import Link from "next/link";
import {useState} from "react";
import {useCart} from "@/components/cart-provider";
export function Purchase({id,soldOut}:{id:string;soldOut:boolean}){const {add}=useCart();const [added,setAdded]=useState(false);function handle(){add(id);setAdded(true);window.setTimeout(()=>setAdded(false),1800)}return <div className="produto-acoes"><button className="btn btn-primario" onClick={handle} disabled={soldOut||added}>{soldOut?"Produto esgotado":added?"Adicionado ✓":"Adicionar ao carrinho"}</button><Link href="/carrinho" className="btn btn-contorno">Ver carrinho</Link></div>}
