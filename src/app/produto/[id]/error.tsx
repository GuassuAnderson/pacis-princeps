"use client";
import Link from "next/link";
export default function ProductError({reset}:{reset:()=>void}) {
  return <div className="container produto-nao-encontrado" role="alert"><h1>Não foi possível carregar este produto</h1><p>Tente novamente em instantes.</p><button type="button" className="btn btn-primario" onClick={reset}>Tentar novamente</button><Link className="btn btn-contorno" href="/produtos">Voltar ao catálogo</Link></div>;
}
