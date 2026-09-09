"use client";

import { useEffect, useState, type RefObject } from 'react';

type Position = { left: number; top: number } | null;
type Box = { left: number; right: number; top: number; bottom: number };
const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export function useFaithSymbolPositions(ref: RefObject<HTMLDivElement | null>) {
  const [positions, setPositions] = useState<Position[]>([]);
  useEffect(() => {
    const network = ref.current;
    const root = network?.closest('.site-faith-pattern, .sobre-pagina-rede');
    if (!network || !root) return;
    let frame = 0;
    let stopped = false;
    const place = () => {
      const bounds = network.getBoundingClientRect();
      const symbol = network.querySelector<HTMLElement>('.sobre-rede-fe-simbolo');
      if (!symbol || getComputedStyle(symbol).display === 'none') return;
      const size = symbol.offsetWidth;
      const blocked: Box[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      // Actual text lines also cover labels, prices and inline text without a <p>.
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!node.textContent?.trim() || !parent || parent.closest('.sobre-rede-fe, svg, script, style, [hidden], dialog:not([open])')) continue;
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          blocked.push({left:rect.left-bounds.left-20,right:rect.right-bounds.left+20,top:rect.top-bounds.top-20,bottom:rect.bottom-bounds.top+20});
        }
      }
      root.querySelectorAll('input, textarea, select').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.width && rect.height) blocked.push({left:rect.left-bounds.left-20,right:rect.right-bounds.left+20,top:rect.top-bounds.top-20,bottom:rect.bottom-bounds.top+20});
      });
      const result: Position[] = [];
      for (const [index, fraction] of [0.04, 0.24, 0.57, 0.8].entries()) {
        const preferred = Math.min(bounds.height-size-14, Math.max(14, bounds.height*fraction));
        const inset = Math.max(14, (bounds.width-1280)/2);
        const sides = [inset, bounds.width-inset-size];
        if (index%2) sides.reverse();
        let chosen: Position = null;
        for (let distance=0; distance<bounds.height && !chosen; distance+=24) {
          for (const top of distance ? [preferred+distance,preferred-distance] : [preferred]) {
            if (top<14 || top+size>bounds.height-14) continue;
            for (const left of sides) {
              const box = {left,right:left+size,top,bottom:top+size};
              if (left<0 || box.right>bounds.width || blocked.some(other=>overlaps(box,other))) continue;
              chosen={left,top};
              blocked.push({left:left-20,right:box.right+20,top:top-20,bottom:box.bottom+20});
              break;
            }
            if (chosen) break;
          }
        }
        result.push(chosen);
      }
      setPositions(previous => JSON.stringify(previous)===JSON.stringify(result) ? previous : result);
    };
    const schedule = () => { if(stopped)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(place); };
    const resize = new ResizeObserver(schedule);
    resize.observe(root);resize.observe(network);
    const mutation = new MutationObserver(records => {
      if(records.some(record=>!(record.target instanceof Element ? record.target : record.target.parentElement)?.closest('.sobre-rede-fe')))schedule();
    });
    mutation.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','hidden']});
    root.addEventListener('load',schedule,true);
    root.addEventListener('transitionend',schedule,true);
    root.addEventListener('animationend',schedule,true);
    document.fonts.ready.then(schedule);
    schedule();
    return()=>{stopped=true;cancelAnimationFrame(frame);resize.disconnect();mutation.disconnect();root.removeEventListener('load',schedule,true);root.removeEventListener('transitionend',schedule,true);root.removeEventListener('animationend',schedule,true);};
  },[ref]);
  return (index:number) => ({...positions[index],right:'auto',visibility:positions[index] ? 'visible' as const : 'hidden' as const});
}
