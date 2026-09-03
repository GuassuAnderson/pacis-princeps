"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { Product } from "@/lib/products";

const positions = ["centro", "direita-1", "direita-2", "esquerda-2", "esquerda-1"];

export function HeroProductCarousel({ products }: { products: Product[] }) {
  const items = products.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % items.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  const move = (direction: number) => {
    setCurrent((index) => (index + direction + items.length) % items.length);
  };

  return (
    <div
      className="hero-produtos-carrossel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Produtos em destaque"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hero-produtos-palco">
        {items.map((product, index) => {
          const position = positions[(index - current + items.length) % items.length];
          const active = position === "centro";

          return (
            <Link
              href={`/produto/${product.id}`}
              className={`hero-produto-moldura hero-produto-${position}`}
              style={{ "--ordem-produto": index } as CSSProperties}
              aria-label={active ? `Ver ${product.name}` : undefined}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              key={product.id}
            >
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 860px) 230px, 280px" unoptimized />
              <span>{product.name}</span>
            </Link>
          );
        })}
      </div>

      <button className="hero-carrossel-seta hero-carrossel-anterior" type="button" onClick={() => move(-1)} aria-label="Produto anterior">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button className="hero-carrossel-seta hero-carrossel-proximo" type="button" onClick={() => move(1)} aria-label="Próximo produto">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>

      <div className="hero-carrossel-pontos" aria-label="Selecionar produto">
        {items.map((product, index) => (
          <button
            type="button"
            className={index === current ? "ativo" : ""}
            onClick={() => setCurrent(index)}
            aria-label={`Mostrar ${product.name}`}
            aria-current={index === current ? "true" : undefined}
            key={product.id}
          />
        ))}
      </div>
    </div>
  );
}
