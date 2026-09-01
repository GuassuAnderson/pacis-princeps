import Link from "next/link";
import { PhotoPlaceholder } from "@/components/photo-placeholder";
import {
  AboutPhotoCarousel,
  ScrollReveal,
} from "@/components/about-interactions";
import { AnimatedTitle } from "@/components/animated-title";

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
              <PhotoPlaceholder
                title="Foto principal"
                subtitle="Substituir por foto real da loja ou dos fundadores"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="secao">
        <div className="container">
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
                    slides={[
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
                name: "Fundadora da PACIS",
                role: "Fundadora & Missionária",
                bio: "Após viver um profundo encontro com Jesus no retiro RENASCER, respondeu ao chamado de Deus e transformou o sonho de evangelizar por meio dos artigos religiosos na missão da PACIS.",
              },
              {
                name: "Nome do Membro",
                role: "Atendimento & Logística",
                bio: "Informações sobre este membro da equipe serão adicionadas em breve.",
              },
              {
                name: "Nome do Membro",
                role: "Comunicação & Design",
                bio: "Informações sobre este membro da equipe serão adicionadas em breve.",
              },
            ].map((member, index) => (
              <ScrollReveal className="card-membro-reveal" delay={index * 110} key={index}>
                <div className="card-membro">
                <div className="membro-foto">
                  <AboutPhotoCarousel
                    label={`Fotos — ${member.name}`}
                    slides={[
                      { title: `Foto — Membro ${index + 1}`, subtitle: "Retrato principal" },
                      { title: `Foto — Membro ${index + 1} · 2`, subtitle: "Momento com a equipe" },
                      { title: `Foto — Membro ${index + 1} · 3`, subtitle: "Vivendo a missão PACIS" },
                    ]}
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
    </>
  );
}
