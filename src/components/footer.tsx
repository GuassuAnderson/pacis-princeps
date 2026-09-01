import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/products";

export function Footer(){return <footer className="rodape">
  <div className="container rodape-grade">
    <div><div className="rodape-marca"><Image src="/images/logo.png" alt="Pacis Princeps" width={48} height={48}/><strong>Pacis Princeps</strong></div><p>Artigos religiosos escolhidos com cuidado: terços, imagens sacras, camisetas e joias para viver a fé todos os dias.</p></div>
    <div><h4>Navegação</h4><ul className="rodape-links"><li><Link href="/">Início</Link></li><li><Link href="/produtos">Produtos</Link></li><li><Link href="/carrinho">Carrinho</Link></li><li><Link href="/sobre">Sobre nós</Link></li><li><Link href="/conexao">Conexão</Link></li><li><Link href="/contato">Contato</Link></li></ul></div>
    <div><h4>Categorias</h4><ul className="rodape-links rodape-categorias">{categories.map(category=><li key={category.id}><Link href={`/produtos?categoria=${category.id}`}>{category.name}</Link></li>)}</ul></div>
    <div><h4>Atendimento</h4><ul className="rodape-links"><li>pacisprinceps@gmail.com</li><li>(45) 99862-5560</li><li>Segunda à sexta, 9h30 às 12 | 13h30 às 18h30</li><li>Sábado, 8h30 às 13h</li><li>Domingo, fechado</li></ul><div className="rodape-sociais" aria-label="Redes sociais"><a href="https://www.instagram.com/pacis_princeps/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da Pacis Princeps"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a><a href="https://www.facebook.com/profile.php?id=61579682021856" target="_blank" rel="noopener noreferrer" aria-label="Facebook da Pacis Princeps"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 21v-8h3l1-4h-4V7c0-1.2.8-2 2-2h2V1h-3c-3.3 0-5 2-5 5v3H7v4h3v8"/></svg></a></div></div>
  </div>
  <div className="container rodape-baixo"><span>© {new Date().getFullYear()} Pacis Princeps — Artigos Religiosos. Todos os direitos reservados.</span><span>Site em versão de demonstração (frontend)</span></div>
</footer>}
