/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";
import { categories } from "@/lib/products";

const links = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/conexao", label: "Conexão" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();
  useEffect(() => {
    setOpen(false);
    setProductsOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <header className="cabecalho">
    <div className="barra-topo" aria-label="Benefícios Pacis Princeps">
      <div className="barra-topo-trilho">
        {[0, 1].map((repeticao) => (
          <div
            className="barra-topo-grupo"
            aria-hidden={repeticao === 1}
            key={repeticao}
          >
            <span>Frete grátis em compras acima de R$ 250</span><i>✦</i>
            <span>Peças abençoáveis</span><i>✦</i>
            <span>Entrega para todo o Brasil</span><i>✦</i>
            <span>Materiais selecionados</span><i>✦</i>
          </div>
        ))}
      </div>
    </div>
      <nav className="nav container">
        <Link href="/" className="marca">
          <Image
            src="/images/logo.png"
            alt="Pacis Princeps"
            width={56}
            height={56}
          />
          <span className="marca-texto">
            <strong>Pacis Princeps</strong>
            <span>Artigos Religiosos</span>
          </span>
        </Link>
        <ul className={`nav-links ${open ? "aberto" : ""}`} data-nav-links>
        {links.map((link) => (
          <li key={link.href} className={link.href === "/produtos" ? "nav-produtos" : undefined}>
            <Link
              href={link.href}
              className={`${pathname === link.href ? "ativo" : ""} ${link.href === "/produtos" ? "nav-produtos-link" : ""}`}
            >
              {link.label}
              {link.href === "/produtos" && <svg className="nav-produtos-seta" viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1 5 5 5-5"/></svg>}
            </Link>
            {link.href === "/produtos" && (
              <button
                type="button"
                className={`nav-produtos-toggle ${productsOpen ? "aberto" : ""}`}
                aria-expanded={productsOpen}
                aria-controls="submenu-produtos-mobile"
                onClick={() => setProductsOpen((value) => !value)}
              >
                Produtos
                <svg className="nav-produtos-seta" viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1 5 5 5-5"/></svg>
              </button>
            )}
            {link.href === "/produtos" && (
              <div className={`submenu-produtos ${productsOpen ? "aberto" : ""}`} id="submenu-produtos-mobile">
                <div className="submenu-produtos-topo"><span>Explore por categoria</span><Link href="/produtos">Ver todos</Link></div>
                <div className="submenu-produtos-grade">
                  {categories.map((category) => (
                    <Link href={`/produtos?categoria=${category.id}`} key={category.id}>
                      <strong>{category.name}</strong>
                      <span>{category.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
        </ul>
        <div className="nav-acoes">
          <Link
            href="/login"
            className="icone-btn"
            aria-label="Área do administrador"
            title="Área do administrador"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <Link
            href="/carrinho"
            className="icone-btn"
            aria-label="Carrinho de compras"
            title="Carrinho"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="contador-carrinho">{count}</span>
          </Link>
          <button
            className="menu-toggle"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {open ? (
                <path d="m5 5 14 14M19 5 5 19" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
