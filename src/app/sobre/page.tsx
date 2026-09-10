import Link from "next/link";
import { PhotoPlaceholder } from "@/components/photo-placeholder";
import {
  AboutPhotoCarousel,
  ScrollReveal,
} from "@/components/about-interactions";
import { AnimatedTitle } from "@/components/animated-title";
import { AboutFaithNetwork } from "@/components/about-faith-network";
import { AboutStoryWindow } from "@/components/about-story-window";

const stories = [
  {
    label: "Como tudo começou",
    title: "De uma devoção pessoal a uma missão compartilhada",
    paragraphs: [
      "Pouco tempo depois, durante a Quaresma de São Miguel Arcanjo, conduzida pelo Frei Gilson, esse chamado tornou-se ainda mais forte. No meu coração, Deus plantava o sonho de empreender no ramo de artigos religiosos, para que mais pessoas pudessem viver e testemunhar a sua fé.",
      "Foi então que tomei decisões que pareciam ousadas aos olhos do mundo. Deixei a advocacia, a pós-graduação e o mestrado para responder ao chamado que Deus colocava diante de mim. Escolhi dedicar-me à minha casa, à minha família e à missão que ele confiava às minhas mãos.",
      "A PACIS nasceu de forma simples: vendendo terços para pessoas conhecidas, carregados em sacolas. A sala da minha casa tornou-se também a primeira loja.",
    ],
    photo: "Foto — Como tudo começou",
    hint: "Ex: foto dos fundadores, primeiro espaço da loja",
  },
  {
    label: "Nosso propósito",
    title: "Fé no dia a dia: mais do que uma loja, um ministério",
    paragraphs: [
      "Entre caixas, orações e muita confiança na Providência Divina, Deus foi conduzindo cada passo. Com o tempo, ele abriu as portas para que tivéssemos um espaço próprio.",
      "Mesmo diante dos medos e das incertezas, experimentamos diariamente os pequenos milagres de Deus, que nunca deixou faltar aquilo de que precisávamos para continuar.",
      "Mas a missão da PACIS nunca foi apenas oferecer artigos religiosos. Desde o início, entendemos que nossa maior vocação é anunciar Jesus Cristo.",
    ],
    photo: "Foto — Nosso propósito",
    hint: "Ex: foto de produtos, ambiente da loja, evento",
  },
  {
    label: "Nossa comunidade",
    title: "Famílias, paróquias e grupos que confiam na Pacis Princeps",
    paragraphs: [
      "Foi desse desejo, compartilhado com nosso grupo de amigos, que nasceu a Conexão PACIS: um encontro mensal, simples e cheio de propósito, onde nos reunimos para falar de Jesus e de Maria, partilhar experiências de fé e fortalecer nossa caminhada como Igreja.",
      "Hoje, a PACIS é muito mais do que uma loja. É um apostolado, um lugar de acolhimento, evangelização e encontro com Deus.",
      "Cada produto que oferecemos, cada atendimento e cada projeto têm o mesmo propósito: ajudar pessoas a se aproximarem de Cristo e a viverem a beleza da fé católica.",
    ],
    photo: "Foto — Nossa comunidade",
    hint: "Ex: foto com clientes, grupo, paróquia parceira",
  },
];
export default function About() {
  return (
    <>
      <section className="sobre-hero">
        <div className="sobre-hero-linhas" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => (
            <span
              key={index}
              style={{
                left: `${118 + index * 120}px`,
                animationDelay: `${index * 250}ms`,
              }}
            />
          ))}
        </div>
        <div className="container sobre-hero-conteudo">
          <div className="sobre-hero-texto sobre-hero-entrada">
            <span className="rotulo">Nossa história</span>
            <AnimatedTitle parts={[
              { text: "Uma loja nascida da " },
              { text: "fé e da devoção", emphasis: true },
            ]} />
            <p>
              A história da PACIS começou em janeiro de 2023, mas, antes de
              tudo, começou no coração de Deus.
            </p>
            <p style={{ marginTop: 16 }}>
              Foi durante o retiro RENASCER, da Igreja Católica, que vivi um
              verdadeiro encontro com Jesus. Ali nasceu um amor profundo por
              Cristo, que transformou completamente a minha vida e despertou em
              mim o desejo de evangelizar.
            </p>
          </div>
          <div className="foto-hero sobre-foto-entrada">
            <div className="foto-hero-moldura">
              <AboutStoryWindow />
            </div>
          </div>
        </div>
      </section>
      <div className="sobre-pagina-rede">
        <AboutFaithNetwork />
      <section className="secao sobre-historias-secao">
        <div className="container sobre-historias-conteudo">
          {stories.map((story, index) => (
            <ScrollReveal
              key={story.title}
              className={index % 2 === 0 ? "reveal-esquerda" : "reveal-direita"}
            >
              <div
                className={`historia-bloco ${index === 1 ? "invertido" : ""}`}
              >
                <div className="historia-texto">
                  <span className="rotulo">{story.label}</span>
                  <AnimatedTitle as="h2" parts={[{ text: story.title }]} />
                  {story.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="historia-foto">
                  <AboutPhotoCarousel
                    label={`Fotos — ${story.label}`}
                    slides={index === 1 ? [
                      {
                        src: "/images/nossa-historia/nosso-proposito/proposito-1.jpg",
                        title: "Comunidade PACIS reunida",
                        alt: "Comunidade PACIS reunida em uma confraternização",
                      },
                      {
                        src: "/images/nossa-historia/nosso-proposito/proposito-2.jpg",
                        title: "Encontro e evangelização",
                        alt: "Representante da PACIS ao lado de um sacerdote em um evento católico",
                      },
                      {
                        src: "/images/nossa-historia/nosso-proposito/proposito-3.jpg",
                        title: "Amigos unidos pela missão",
                        alt: "Grupo de amigos da PACIS reunido em um encontro",
                      },
                      {
                        src: "/images/nossa-historia/nosso-proposito/proposito-4.jpg",
                        title: "Alegria em comunidade",
                        alt: "Comunidade PACIS celebrando junta em um momento descontraído",
                      },
                      {
                        src: "/images/nossa-historia/nosso-proposito/proposito-5.jpg",
                        title: "Caminhada compartilhada",
                        alt: "Integrantes da comunidade PACIS reunidos na loja",
                      },
                      {
                        src: "/images/nossa-historia/nosso-proposito/proposito-6.jpg",
                        title: "Devoção a Nossa Senhora",
                        alt: "Representante da PACIS diante da imagem de Nossa Senhora de Fátima",
                      },
                    ] : [
                      { title: story.photo, subtitle: story.hint },
                      {
                        title: `${story.label} — foto 2`,
                        subtitle: "Adicione aqui outro momento desta história",
                      },
                      {
                        title: `${story.label} — foto 3`,
                        subtitle: "Adicione aqui mais uma fotografia",
                      },
                    ]}
                  />
                </div>
              </div>
              {index < stories.length - 1 ? (
                <div className="ornamento-divisor">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              ) : null}
            </ScrollReveal>
          ))}
        </div>
      </section>
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container">
          <ScrollReveal>
            <div className="faixa-valores">
            <div className="faixa-valores-topo">
              <span className="rotulo">O que nos move</span>
              <AnimatedTitle as="h2" parts={[{ text: "Nossos valores" }]} />
            </div>
            <div className="grade-valores">
              <div className="card-valor">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h4>Fé autêntica</h4>
                <p>
                  Tudo o que fazemos nasce de uma fé vivida e do desejo sincero
                  de anunciar Jesus Cristo por meio de cada produto, atendimento
                  e projeto.
                </p>
              </div>
              <div className="card-valor">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
                <h4>Amor ao próximo</h4>
                <p>
                  Acolher, escutar e servir fazem parte da nossa missão.
                  Queremos que cada pessoa se sinta mais próxima de Deus ao
                  passar pela PACIS.
                </p>
              </div>
              <div className="card-valor">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <h4>Qualidade e cuidado</h4>
                <p>
                  Cuidamos de cada detalhe com responsabilidade, carinho e
                  propósito, confiando sempre na Providência Divina que
                  sustentou nossa caminhada.
                </p>
              </div>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <section className="secao" style={{ paddingTop: 20 }}>
        <div className="container">
          <ScrollReveal>
            <div className="secao-cabecalho">
            <div>
              <span className="rotulo">Quem somos</span>
              <AnimatedTitle as="h2" parts={[{ text: "Nossa equipe" }]} />
            </div>
            <p>
              Uma missão construída com fé, família, amizade e confiança na
              Providência Divina.
            </p>
            </div>
          </ScrollReveal>
          <div className="grade-equipe">
            {[
              {
                name: "Fundadores da PACIS",
                role: "Casal de Fundadores",
                bio: "Um casal unido pela fé e pelo desejo de servir. Entre a vida em família, a oração e a confiança na Providência Divina, acolhe a missão de fazer da PACIS um lugar de encontro com Cristo. Cada passo dessa história é um sim dado juntos, com amor e dedicação.",
                photos: [
                  { src: "/images/equipe/fundadores-1.webp", title: "Fundadores — na PACIS", alt: "Casal de fundadores sentado no espaço da PACIS" },
                  { src: "/images/equipe/fundadores-2.webp", title: "Fundadores — devoção compartilhada", alt: "Fundadores juntos com uma imagem de Padre Pio" },
                  { src: "/images/equipe/fundadores-3.webp", title: "Fundadores — nossa caminhada", alt: "Casal de fundadores diante da parede de tijolos da PACIS" },
                ],
              },
              {
                name: "Time PACIS",
                role: "Amigos conectados pela missão",
                bio: "Somos amigos que encontraram na fé um motivo para caminhar juntos. Partilhamos a alegria de servir, acolher e anunciar Jesus e Maria, colocando nossos dons a serviço de cada encontro. Na PACIS, a amizade se torna missão e cada pessoa faz parte dessa família.",
                photos: [
                  { src: "/images/equipe/time-pacis-1.webp", title: "Time PACIS — alegria de estar juntos", alt: "Time PACIS reunido em um momento descontraído na loja" },
                  { src: "/images/equipe/time-pacis-2.webp", title: "Time PACIS — amizade e missão", alt: "Amigos do Time PACIS reunidos com suas famílias" },
                ],
              },
            ].map((member, index) => (
              <ScrollReveal className="card-membro-reveal" delay={index * 110} key={index}>
                <div className="card-membro">
                <div className="membro-foto">
                  <AboutPhotoCarousel
                    label={`Fotos — ${member.name}`}
                    slides={member.photos}
                  />
                </div>
                <div className="membro-info">
                  <h4>{member.name}</h4>
                  <span className="rotulo">{member.role}</span>
                  <p>{member.bio}</p>
                </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      <section className="secao" style={{ paddingTop: 10 }}>
        <div className="container">
          <ScrollReveal>
            <div className="secao-cabecalho">
            <div>
              <span className="rotulo">Nossa trajetória em imagens</span>
              <AnimatedTitle as="h2" parts={[{ text: "Galeria" }]} />
            </div>
            </div>
          </ScrollReveal>
          <ScrollReveal className="galeria-sobre-carrossel" delay={100}>
            <AboutPhotoCarousel label="Galeria da trajetória PACIS" slides={[
              { title: "Foto galeria — grande", subtitle: "Nossa trajetória em imagens" },
              { title: "Foto galeria 2", subtitle: "Momentos que marcaram nossa história" },
              { title: "Foto galeria 3", subtitle: "Fé, família e comunidade" },
              { title: "Foto galeria 4", subtitle: "A missão continua" },
            ]}/>
          </ScrollReveal>
        </div>
      </section>
      <section className="secao" style={{ paddingTop: 10 }}>
        <div className="container">
          <ScrollReveal>
            <div className="cta-sobre">
            <span
              className="rotulo"
              style={{ display: "block", marginBottom: 12 }}
            >
              Faça parte desta história
            </span>
            <AnimatedTitle as="h2" parts={[{ text: "Venha caminhar conosco na fé" }]} />
            <p>
              A PACIS nasceu de uma conversão, cresceu pela Providência Divina e
              continua existindo por um único motivo: dizer “sim” à missão que
              Deus nos confiou.
            </p>
            <div className="acoes">
              <Link href="/produtos" className="btn btn-primario">
                Ver produtos
              </Link>
              <Link href="/conexao" className="btn btn-contorno">
                Conhecer o Conexão
              </Link>
              <Link href="/contato" className="btn btn-contorno">
                Falar conosco
              </Link>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      </div>
    </>
  );
}
