"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type TitlePart = { text: string; emphasis?: boolean };

export function AnimatedTitle({ parts, className = "", as = "h1" }: { parts: TitlePart[]; className?: string; as?: "h1" | "h2" }) {
  const root = useRef<HTMLHeadingElement>(null);
  const [active, setActive] = useState(false);
  let characterIndex = 0;
  const label = parts.map((part) => part.text).join("");

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const renderPart = (part: TitlePart, partIndex: number) => {
    const content: ReactNode[] = part.text.split(/(\s+)/).map((token, tokenIndex) => {
      if (/^\s+$/.test(token)) return <span key={`${partIndex}-${tokenIndex}`}> </span>;
      return (
        <span className="titulo-revelado-palavra" key={`${partIndex}-${tokenIndex}`}>
          {Array.from(token).map((letter) => {
            const delay = 100 + characterIndex * 38;
            characterIndex += 1;
            return (
              <span
                className="titulo-revelado-letra"
                style={{ animationDelay: `${delay}ms` } as CSSProperties}
                key={`${partIndex}-${tokenIndex}-${characterIndex}`}
              >
                {letter}
              </span>
            );
          })}
        </span>
      );
    });

    return part.emphasis ? <em key={partIndex}>{content}</em> : <span key={partIndex}>{content}</span>;
  };

  const Heading = as;
  return (
    <Heading ref={root} className={`titulo-revelado ${active ? "titulo-revelado-ativo" : ""} ${className}`.trim()} aria-label={label}>
      <span aria-hidden="true">{parts.map(renderPart)}</span>
    </Heading>
  );
}
