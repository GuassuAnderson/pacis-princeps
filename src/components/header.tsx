/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {useCart} from "./cart-provider";

const links=[
  {href:"/",label:"Início"},
  {href:"/produtos",label:"Produtos"},
  {href:"/sobre",label:"Sobre nós"},
  {href:"/conexao",label:"Conexão"},
  {href:"/contato",label:"Contato"},
];

export function Header(){
  const [open,setOpen]=useState(false);
  const pathname=usePathname();
  const {count}=useCart();
  useEffect(()=>{setOpen(false)},[pathname]);
  useEffect(()=>{document.body.style.overflow=open?"hidden":"";return()=>{document.body.style.overflow=""}},[open]);
  return <header className="cabecalho">
    <div className="barra-topo">Frete grátis para todo o Brasil em compras acima de R$ 250</div>
    <nav className="nav container">
      <Link href="/" className="marca">
        <Image src="/images/logo.png" alt="Pacis Princeps" width={56} height={56}/>
        <span className="marca-texto"><strong>Pacis Princeps</strong><span>Artigos Religiosos</span></span>
      </Link>
      <ul className={`nav-links ${open?"aberto":""}`} data-nav-links>
        {links.map(link=><li key={link.href}><Link href={link.href} className={pathname===link.href?"ativo":undefined}>{link.label}</Link></li>)}
      </ul>
      <div className="nav-acoes">
        <Link href="/login" className="icone-btn" aria-label="Área do administrador" title="Área do administrador">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
        </Link>
        <Link href="/carrinho" className="icone-btn" aria-label="Carrinho de compras" title="Carrinho">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span className="contador-carrinho">{count}</span>
        </Link>
        <button className="menu-toggle" aria-label={open?"Fechar menu":"Abrir menu"} aria-expanded={open} onClick={()=>setOpen(value=>!value)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">{open?<path d="m5 5 14 14M19 5 5 19"/>:<path d="M3 6h18M3 12h18M3 18h18"/>}</svg>
        </button>
      </div>
    </nav>
  </header>;
}
