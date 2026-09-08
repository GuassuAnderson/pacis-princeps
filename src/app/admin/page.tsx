import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/server/auth";
import { catalogMetrics, listProducts } from "@/lib/server/catalog";
import { categoryName,money } from "@/lib/products";

export default async function Dashboard() {
  if (!(await currentAdmin())) redirect("/login");
  const [metrics,products] = await Promise.all([catalogMetrics(),listProducts({limit:5},true)]);
  const cards=[["Produtos cadastrados",metrics.total],["Em destaque",metrics.featured],["Unidades em estoque",metrics.stock],["Categorias",metrics.categories]];
  return <><div className="grade-metricas">{cards.map(([label,value])=><div className="card-metrica" key={label}><div className="card-metrica-label">{label}</div><div className="card-metrica-valor">{value}</div><span className="card-metrica-delta">Dados do catálogo</span></div>)}</div>
    <div className="painel-card"><div className="painel-card-topo"><h3>Produtos recentes</h3><Link href="/admin/produtos" className="btn btn-primario btn-sm">Gerenciar produtos</Link></div><div style={{overflowX:"auto"}}><table className="tabela-produtos"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Publicação</th></tr></thead><tbody>{products.items.map(product=><tr key={product.id}><td><strong>{product.name}</strong></td><td>{categoryName(product.category)}</td><td>{money(product.price)}</td><td>{product.stock}</td><td>{product.active ? "Publicado" : "Não publicado"}</td></tr>)}{!products.total && <tr><td colSpan={5} className="tabela-vazia">Cadastre o primeiro produto para começar.</td></tr>}</tbody></table></div></div>
  </>;
}
