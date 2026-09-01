import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { HomeSheepSurprise } from "@/components/home-sheep-surprise";
import { Newsletter } from "@/components/newsletter";
import { NewsletterSheepFlock } from "@/components/newsletter-sheep-flock";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/products";

function ScrollingNote({ text }: { text: string }) {
  return <div className="secao-texto-carrossel" aria-label={text}><div className="secao-texto-trilho"><span>{text}</span><i aria-hidden="true">✦</i><span aria-hidden="true">{text}</span><i aria-hidden="true">✦</i></div></div>;
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <svg
          className="hero-arcos"
          viewBox="0 0 1240 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="arcoPadrao"
              width="150"
              height="220"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 220 V90 A75 75 0 0 1 150 90 V220"
                fill="none"
                stroke="#803e24"
                strokeOpacity="0.08"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="1240" height="600" fill="url(#arcoPadrao)" />
        </svg>
        <div className="container hero-conteudo">
          <div className="hero-texto">
            <span className="rotulo">Fé em cada detalhe</span>
            <h1>
              Peças que acompanham sua <em>caminhada de fé</em>
            </h1>
            <div className="hero-acoes">
              <Link href="/produtos" className="btn btn-primario">
                Ver todos os produtos
              </Link>
              <a href="#categorias" className="btn btn-contorno">
                Explorar categorias
              </a>
            </div>
            <div
              className="hero-texto-carrossel"
              aria-label="Aqui você encontra uma seleção especial de artigos religiosos para viver e expressar a sua fé todos os dias. Terços, imagens sacras, camisetas, joias católicas, livros, acessórios, presentes e diversos itens de devoção são escolhidos com cuidado, qualidade e propósito."
            >
              <div className="hero-texto-trilho">
                <span>
                  Aqui você encontra uma seleção especial de artigos religiosos
                  para viver e expressar a sua fé todos os dias. Terços, imagens
                  sacras, camisetas, joias católicas, livros, acessórios,
                  presentes e diversos itens de devoção são escolhidos com
                  cuidado, qualidade e propósito.
                </span>
                <span aria-hidden="true">
                  Aqui você encontra uma seleção especial de artigos religiosos
                  para viver e expressar a sua fé todos os dias. Terços, imagens
                  sacras, camisetas, joias católicas, livros, acessórios,
                  presentes e diversos itens de devoção são escolhidos com
                  cuidado, qualidade e propósito.
                </span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="arco-moldura">
              <Image
                src="/images/logo-foto.jpeg"
                alt="Bom Pastor — identidade Pacis Princeps"
                width={700}
                height={900}
                priority
              />
            </div>
            <div className="medalhao-flutuante">
              <svg className="medalhao-ovelha" viewBox="0 0 124 112" aria-hidden="true">
                <path d="M31 32C24 24 28 13 38 13 42 3 55 3 62 11 69 3 82 6 86 16 96 13 105 21 102 31 113 25 122 32 120 43 114 50 106 51 98 47v22c-1 23-17 39-36 39S27 92 26 69V47c-8 4-17 3-22-4-2-11 8-18 19-12 2 1 5 2 8 1Z" />
              </svg>
              <strong>+8mil</strong>
              <span>Famílias atendidas</span>
            </div>
          </div>
        </div>
      </section>
      <section className="secao">
        <div className="container">
          <div className="secao-cabecalho">
            <div>
              <span className="rotulo">Selecionados para você</span>
              <h2>Produtos em destaque</h2>
            </div>
            <ScrollingNote text="Uma curadoria das peças mais procuradas da nossa loja neste mês." />
          </div>
          <div className="grade-produtos">
            {products
              .filter((product) => product.featured)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
          <div className="ver-todos-wrap">
            <Link href="/produtos" className="btn btn-contorno">
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>
      <section className="secao" id="categorias">
        <div className="container">
          <div className="secao-cabecalho">
            <div>
              <span className="rotulo">Explore a loja</span>
              <h2>Compre por categoria</h2>
            </div>
            <ScrollingNote text="Coleções pensadas para diferentes momentos da sua devoção." />
          </div>
          <div className="grade-categorias">
            {categories.map((category) => (
              <Link
                href={`/produtos?categoria=${category.id}`}
                className="cartao-categoria"
                key={category.id}
              >
                <div className="cartao-categoria-topo">
                  <CategoryIcon category={category.id} />
                </div>
                <h3>{category.name}</h3>
                <span>{category.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="faixa-promessa">
        <div className="container grade-promessa">
          <div className="item-promessa">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 3 6v6c0 5 3.8 9 9 10 5.2-1 9-5 9-10V6l-9-4Z" />
            </svg>
            <h4>Compra protegida</h4>
            <p>Pagamento processado com segurança do início ao fim.</p>
          </div>
          <div className="item-promessa">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M16 3v8M8 3v8" />
            </svg>
            <h4>Envio para todo o país</h4>
            <p>Embalagem cuidadosa para que a peça chegue intacta.</p>
          </div>
          <div className="item-promessa">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-9 8.38A8.5 8.5 0 1 1 20 7" />
              <path d="M22 2 12 12" />
            </svg>
            <h4>Atendimento próximo</h4>
            <p>Dúvidas sobre uma peça? Fale com a gente antes de comprar.</p>
          </div>
          <div className="item-promessa">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M4 9h16M9 4v16" />
            </svg>
            <h4>Troca facilitada</h4>
            <p>7 dias para troca caso a peça não seja o que esperava.</p>
          </div>
        </div>
      </section>
      <section className="secao secao-manifesto-animada">
        <HomeSheepSurprise />
        <div className="container manifesto">
          <div className="manifesto-visual">
            <Image
              src="/images/logo-foto.jpeg"
              alt="Identidade Pacis Princeps"
              width={700}
              height={850}
            />
          </div>
          <div className="manifesto-texto">
            <span className="rotulo">Nossa história</span>
            <h2>Uma loja para quem quer viver a fé, não só guardá-la</h2>
            <blockquote>
              “O Pacis Princeps é o Príncipe da Paz — e cada peça que vendemos
              carrega esse desejo: paz para dentro de casa, para o trabalho,
              para o dia comum.”
            </blockquote>
            <p>
              Nascemos como uma pequena loja de artigos religiosos e crescemos
              ao lado de famílias que buscavam mais do que produtos: buscavam
              sentido. Hoje selecionamos terços, imagens, camisetas e joias com
              o mesmo cuidado de um presente feito à mão.
            </p>
            <Link href="/sobre" className="btn btn-primario">
              Conheça nossa história completa
            </Link>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="newsletter">
          <div className="newsletter-texto">
            <h3>Receba bênçãos e novidades</h3>
            <p>
              Cadastre seu e-mail e receba lançamentos, promoções e reflexões
              semanais direto na sua caixa de entrada.
            </p>
          </div>
          <NewsletterSheepFlock />
          <Newsletter />
        </div>
      </section>
    </>
  );
}
