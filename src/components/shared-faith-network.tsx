"use client";

import { useEffect, useRef, useState } from 'react';
import { AboutFaithNetwork } from './about-faith-network';

// Keep the same decoration as Sobre, starting after each page's opening section.
export function SharedFaithNetwork() {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    const container = ref.current?.parentElement;
    if (!container) return;
    let frame = 0;
    let opening: Element | null = null;
    const measure = () => {
      const next = container.querySelector<HTMLElement>(':scope > .hero, :scope > .cabecalho-pagina, :scope > main > .conexao-hero, :scope > main > .cabecalho-pagina');
      if (next !== opening) {
        if (opening) resize.unobserve(opening);
        opening = next;
        if (opening) resize.observe(opening);
      }
      let bottom = next?.offsetHeight ?? 0;
      // Layout offsets ignore the entrance animations applied to the hero.
      let ancestor: HTMLElement | null = next;
      while (ancestor && ancestor !== container) {
        bottom += ancestor.offsetTop;
        ancestor = ancestor.offsetParent as HTMLElement | null;
      }
      setTop(bottom);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(schedule);
    resize.observe(container);
    const mutation = new MutationObserver(schedule);
    mutation.observe(container, { childList: true, subtree: true });
    schedule();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); };
  }, []);

  return <div ref={ref} className="shared-faith-network" aria-hidden="true" style={{ top: top ?? 0, visibility: top === null ? 'hidden' : 'visible' }}><AboutFaithNetwork /></div>;
}
