"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const sheep = ["Luz", "Paz", "Fé", "Graça", "Amor", "Vida", "Esperança"];

export function NewsletterSheepFlock() {
  const root = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const timer = window.setInterval(() => setCycle((current) => current + 1), 7800);
    return () => window.clearInterval(timer);
  }, [started]);

  return (
    <div ref={root} className={`newsletter-rebanho ${started ? "newsletter-rebanho-ativo" : ""}`} aria-hidden="true">
      {sheep.map((name, index) => (
        <div
          className="newsletter-ovelhinha"
          key={`${name}-${cycle}`}
          style={{
            "--ovelha-entrada": `${index * 0.4}s`,
            "--ovelha-gesto": `${3.45 + index * 0.045}s`,
            "--ovelha-piscar": `${3.6 + index * 0.04}s`,
            "--ovelha-saida": `${6.25 + (6 - index) * 0.045}s`,
          } as CSSProperties}
        >
          <svg viewBox="0 0 100 86">
            <path className="newsletter-ovelha-la" d="M20 58c-8-2-10-12-5-18-3-8 3-16 12-15 2-9 13-13 21-7 7-8 20-7 25 2 9-5 19 1 19 11 9 3 10 15 3 21 3 9-5 17-14 17H29c-9 1-16-7-14-15l5-4Z" />
            <path className="newsletter-ovelha-rosto" d="M39 27c2-9 9-15 17-15s15 6 17 15v18c-1 12-9 19-17 19s-16-7-17-19V27Z" />
            <path className="newsletter-ovelha-traco" d="M39 27c2-9 9-15 17-15s15 6 17 15v18c-1 12-9 19-17 19s-16-7-17-19V27ZM40 30c-9-6-17-3-17 5 6 4 11 4 17-1m32-4c9-6 17-3 17 5-6 4-11 4-17-1M42 23c3 4 6 4 10 1 3 4 7 4 10 0 3 3 7 3 9-1" />
            <circle className="newsletter-ovelha-olho" cx="50" cy="38" r="1.8" />
            <circle className="newsletter-ovelha-olho newsletter-ovelha-olho-pisca" cx="63" cy="38" r="1.8" />
            <path className="newsletter-ovelha-piscada" d="M60 39q3 3 6 0" />
            <path className="newsletter-ovelha-traco" d="m54 43 2 2 2-2m-2 2v4M36 58c-2 8-2 15-1 22m12-21c-1 8-1 14 0 21m-13 0h14M68 59c1 8 1 14 0 21m11-22c3 8 3 15 2 22m-14 0h15M36 55 25 63" />
            <g className="newsletter-ovelha-braco"><path className="newsletter-ovelha-traco" d="M72 56c8-2 13-7 16-13m0 0 4-5m-4 5 6 1" /></g>
          </svg>
        </div>
      ))}
    </div>
  );
}
