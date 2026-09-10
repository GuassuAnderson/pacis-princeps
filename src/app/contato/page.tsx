import { AnimatedTitle } from "@/components/animated-title";
import ContactForm from "@/components/contact-form";

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16.92Z" />
  </svg>
);

export default function Contact() {
  return (
    <main className="contato-pagina">
      <section className="contato-hero">
        <div className="contato-hero-arcos" aria-hidden="true"><i /><i /><i /></div>
        <div className="container contato-hero-conteudo">
          <div className="contato-hero-texto">
            <span className="rotulo">Fale conosco</span>
            <AnimatedTitle parts={[{ text: "Estamos aqui para " }, { text: "acolher você", emphasis: true }]} />
            <p>Tem dúvidas sobre uma peça, pedido ou envio? Conte com a gente. Cada mensagem é recebida com atenção, carinho e propósito.</p>
            <div className="contato-hero-promessas" aria-label="Nosso atendimento">
              <span><i aria-hidden="true">✦</i> Atendimento próximo</span>
              <span><i aria-hidden="true">✦</i> Resposta em até 1 dia útil</span>
            </div>
          </div>
          <div className="contato-hero-selo" aria-hidden="true">
            <div className="contato-selo-arco">
              <svg viewBox="0 0 64 64" fill="none"><path d="M32 55S10 43.6 10 25.5C10 16.9 16.8 11 24.2 11c4.4 0 7.2 2.1 7.8 5 .6-2.9 3.4-5 7.8-5C47.2 11 54 16.9 54 25.5 54 43.6 32 55 32 55Z"/><path d="M32 16v27M23 28h18"/></svg>
              <span>Conte conosco</span>
              <strong>Será uma alegria<br />ouvir você</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="container contato-layout" aria-labelledby="titulo-mensagem">
        <div className="contato-formulario-card">
          <div className="contato-card-cabecalho">
            <span className="rotulo">Sua mensagem</span>
            <h2 id="titulo-mensagem">Como podemos ajudar?</h2>
            <p>Preencha os campos abaixo e nossa equipe retornará assim que possível.</p>
          </div>
          <ContactForm />
        </div>

        <aside className="bloco-info" aria-label="Canais de atendimento">
          <div className="bloco-info-ornamento" aria-hidden="true">P</div>
          <span className="rotulo">Canais de atendimento</span>
          <h3>Escolha como prefere conversar</h3>
          <p>Para respostas mais rápidas, fale conosco pelo WhatsApp durante o horário de atendimento.</p>
          <a className="contato-item" href="https://wa.me/5545998625560" target="_blank" rel="noreferrer">
            <span className="contato-item-icone"><PhoneIcon /></span><span><strong>WhatsApp</strong><small>(45) 99862-5560</small></span><b aria-hidden="true">↗</b>
          </a>
          <a className="contato-item" href="mailto:pacisprinceps@gmail.com">
            <span className="contato-item-icone"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span><span><strong>E-mail</strong><small>pacisprinceps@gmail.com</small></span><b aria-hidden="true">↗</b>
          </a>
          <div className="contato-item contato-horario">
            <span className="contato-item-icone"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
            <span><strong>Horário de atendimento</strong><small>Segunda à sexta · 9h30–12h e 13h30–18h30</small><small>Sábado · 8h30–13h</small><small>Domingo · fechado</small></span>
          </div>
          <div className="contato-info-rodape"><i aria-hidden="true">✦</i><span>Feito com fé, cuidado e dedicação.</span></div>
        </aside>
      </section>

      <section className="localizacao" aria-labelledby="titulo-localizacao">
        <div className="container">
          <div className="secao-cabecalho localizacao-cabecalho">
            <div><span className="rotulo">Visite-nos</span><h2 id="titulo-localizacao">Nossa localização</h2></div>
            <p>Venha conhecer a Pacis Princeps e descobrir nossos artigos religiosos de perto.</p>
          </div>
          <div className="mapa-moldura">
            <div className="mapa-embed"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2109.8464587300828!2d-54.33397737609445!3d-24.859639093305912!2m3!1f0!2f0!3f0!3m2!1i1024!1i768!4f13.1!3m3!1m2!1s0x94f46ff96b32ff3f%3A0xcfec2c75ef4ac46!2sPacis%20Princeps!5e1!3m2!1spt-BR!2sbr!4v1785352160685!5m2!1spt-BR!2sbr" title="Localização da Pacis Princeps no Google Maps" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
            <div className="mapa-legenda"><span aria-hidden="true">✦</span><div><strong>Pacis Princeps</strong><small>Artigos Religiosos</small></div></div>
          </div>
        </div>
      </section>
    </main>
  );
}
