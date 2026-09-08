import Link from "next/link";
export default function ProductNotFound() { return <div className="container produto-nao-encontrado"><h1>Produto não encontrado</h1><p>Este produto não está disponível na loja.</p><Link href="/produtos" className="btn btn-primario">Ver catálogo</Link></div>; }
