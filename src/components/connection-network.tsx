"use client";

import { useEffect, useState } from "react";

type Point = { x: number; y: number };
type Edge = { from: Point; to: Point };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function createPoints() {
  const points: Point[] = [];
  while (points.length < 12) {
    let candidate: Point | null = null;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const next = { x: 55 + Math.random() * 890, y: 45 + Math.random() * 510 };
      if (points.every((point) => distance(point, next) >= 78)) {
        candidate = next;
        break;
      }
    }
    points.push(candidate ?? { x: 55 + Math.random() * 890, y: 45 + Math.random() * 510 });
  }
  return points;
}

function createEdges(points: Point[]) {
  const pairs: Array<[number, number]> = [];
  const used = new Set<string>();
  const add = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || used.has(key)) return false;
    used.add(key);
    pairs.push([a, b]);
    return true;
  };

  // A árvore inicial garante que cada ponto faça parte da mesma rede.
  for (let index = 1; index < points.length; index += 1) {
    add(index, Math.floor(Math.random() * index));
  }

  // Ligações longas extras criam cruzamentos e pontos com várias conexões.
  let attempts = 0;
  while (pairs.length < 19 && attempts < 240) {
    attempts += 1;
    const a = Math.floor(Math.random() * points.length);
    const b = Math.floor(Math.random() * points.length);
    if (distance(points[a], points[b]) > 260) add(a, b);
  }

  for (let a = 0; a < points.length && pairs.length < 19; a += 1) {
    for (let b = a + 1; b < points.length && pairs.length < 19; b += 1) add(a, b);
  }

  return pairs.map(([from, to]) => ({ from: points[from], to: points[to] }));
}

export function ConnectionNetwork() {
  const [network, setNetwork] = useState<{ points: Point[]; edges: Edge[] }>({ points: [], edges: [] });

  useEffect(() => {
    const points = createPoints();
    setNetwork({ points, edges: createEdges(points) });
  }, []);

  return (
    <svg className="conexao-rede" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      {network.edges.map((edge, index) => (
        <line
          className="conexao-rede-fio"
          x1={edge.from.x}
          y1={edge.from.y}
          x2={edge.to.x}
          y2={edge.to.y}
          pathLength="1"
          style={{ animationDelay: `${0.15 + index * 0.16}s` }}
          key={`fio-${index}`}
        />
      ))}
      {network.points.map((point, index) => (
        <g
          className="conexao-rede-ponto"
          style={{ animationDelay: `${0.05 + index * 0.13}s` }}
          key={`ponto-${index}`}
        >
          <circle className="conexao-rede-pulso" cx={point.x} cy={point.y} r="10" />
          <circle className="conexao-rede-nucleo" cx={point.x} cy={point.y} r="3.8" />
        </g>
      ))}
    </svg>
  );
}
