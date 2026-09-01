"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const groupSelector = [
  "main section",
  ".login-card",
  ".produto-detalhe",
  ".resumo-carrinho",
  ".item-carrinho",
  ".card-produto",
  ".cartao-produto",
  ".card-categoria",
  ".card-contato",
  ".contato-card",
  ".admin-card",
  ".painel-card",
  "main form",
].join(",");

const textSelector = [
  ".rotulo",
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "blockquote",
  ".acoes",
  ".hero-acoes",
  ".hero-selos",
  ".campo-grupo",
  ".campo-grupo-modal",
  "button[type='submit']",
].join(",");

export function GlobalScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/sobre" || pathname === "/conexao") return;

    let observer: IntersectionObserver;
    let mutationObserver: MutationObserver;
    const prepared = new WeakSet<Element>();

    const prepare = () => {
      const groups = [...document.querySelectorAll<HTMLElement>(groupSelector)];

      groups.forEach((group) => {
        if (prepared.has(group)) return;
        prepared.add(group);
        group.classList.add("global-scroll-reveal");

        const texts = [...group.querySelectorAll<HTMLElement>(textSelector)].filter(
          (element) => {
            const closestGroup = element.closest(groupSelector);
            return closestGroup === group;
          },
        );

        texts.forEach((element, index) => {
          element.classList.add("global-text-reveal");
          element.style.setProperty("--global-text-delay", `${Math.min(index, 6) * 85 + 110}ms`);
        });

        observer.observe(group);
      });
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("global-scroll-visivel");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.03, rootMargin: "0px 0px -4% 0px" },
    );

    const frame = window.requestAnimationFrame(prepare);
    mutationObserver = new MutationObserver(prepare);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
