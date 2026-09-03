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

function clearGlobalAnimations(root: ParentNode = document) {
  if (root instanceof HTMLElement) {
    root.classList.remove("global-scroll-reveal", "global-scroll-visivel");
  }

  root.querySelectorAll<HTMLElement>(".global-scroll-reveal").forEach((element) => {
    element.classList.remove("global-scroll-reveal", "global-scroll-visivel");
  });

  root.querySelectorAll<HTMLElement>(".global-text-reveal").forEach((element) => {
    element.classList.remove("global-text-reveal");
    element.style.removeProperty("--global-text-delay");
  });
}

export function GlobalScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/sobre" || pathname === "/conexao") {
      clearGlobalAnimations();
      return;
    }

    const prepared = new Set<HTMLElement>();

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

    const observer = new IntersectionObserver(
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
    const mutationObserver = new MutationObserver(prepare);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      mutationObserver.disconnect();
      prepared.forEach((group) => clearGlobalAnimations(group));
    };
  }, [pathname]);

  return null;
}
