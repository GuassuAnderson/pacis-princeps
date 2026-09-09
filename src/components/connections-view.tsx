"use client";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { instagramUrl } from '@/lib/instagram-url';
import {
  Connection,
  type ConnectionList,
  formatConnectionDate,
} from "@/lib/connections";
import {
  AboutPhotoCarousel,
  ScrollReveal,
  type AboutSlide,
} from "@/components/about-interactions";
import { AnimatedTitle } from "@/components/animated-title";

import { api } from '@/lib/client-api';
const slidesFor = (connection: Connection): AboutSlide[] =>
  connection.photos.length
    ? connection.photos.map((src, index) => ({
        src,
        title: `${connection.title} — foto ${index + 1}`,
        alt: `${connection.title}, foto ${index + 1}`,
      }))
    : [1, 2, 3].map((number) => ({
        title: `Foto do evento — ${number}`,
        subtitle: "Adicione uma fotografia desta edição",
      }));
const Star = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const Person = () => (
  <div className="pregador-avatar">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </div>
);
const Calendar = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

function Instagram() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>;
}
function PreacherInfo({ connection }: { connection: Connection }) {
  const profile = instagramUrl(connection.preacherInstagram);
  const edition = instagramUrl(connection.editionInstagram);
  return <div className="pregador-info">
    <Person />
    <div className="pregador-texto">
      <strong>{connection.preacher}</strong>
      <span>{connection.role || 'Pregador convidado'}</span>
      {profile && <a className="conexao-instagram" href={profile} target="_blank" rel="noopener noreferrer"><Instagram/>{connection.preacherInstagramLabel || 'Instagram do pregador'}</a>}
    </div>
    {edition && <a className="conexao-instagram conexao-instagram-edicao" href={edition} target="_blank" rel="noopener noreferrer"><span className="conexao-instagram-emblema"><Instagram/></span>{connection.editionInstagramLabel || 'Edição no Instagram'}</a>}
  </div>;
}

export default function ConnectionsView() {
  const [all, setAll] = useState<Connection[]>([]);
  const [year, setYear] = useState("todas");
  const [selected, setSelected] = useState<Connection | null>(null);
  const [closing, setClosing] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  function openEdition(connection: Connection, button: HTMLButtonElement) {
    opener.current = button;
    setClosing(false);
    setSelected(connection);
  }
  function closeEdition() { setClosing(true); }
  function openCard(connection: Connection, event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('a, button')) return;
    const button = event.currentTarget.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]');
    if (button) openEdition(connection, button);
  }
  const [page,setPage] = useState(1);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [revision,setRevision] = useState(0);
  useEffect(() => {
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      setLoading(true);setError('');
      try {
        const query=new URLSearchParams({page:String(page)});
        if(year!=='todas')query.set('year',year);
        const result=await api<ConnectionList>('/api/connections?'+query,{signal:controller.signal});
        if(!controller.signal.aborted){setAll(result.items);setTotal(result.total);}
      } catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:'Falha ao carregar edições.');}
      finally{if(!controller.signal.aborted)setLoading(false);}
    },0);
    return()=>{clearTimeout(timer);controller.abort();};
  },[year,page,revision]);
  useEffect(() => {
    const dialog = modal.current;
    if (!selected || !dialog) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.scrollTop = 0;
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      opener.current?.focus({ preventScroll: true });
    };
  }, [selected]);
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => setSelected(null), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240);
    return () => clearTimeout(timer);
  }, [closing]);
  const published = useMemo(
    () =>
      all
        .filter((c) => c.published)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date)),
    [all],
  );

  const shown =
    year === "todas"
      ? published
      : published.filter((c) => c.date.startsWith(year));
  const latest = shown[0];
  return (
    <>
      <ScrollReveal className="conexao-reveal-filtro">
        <div className="filtro-edicoes">
        <span>Filtrar:</span>
        <button
          className={`btn-filtro ${year === "todas" ? "ativo" : ""}`}
          onClick={() => {setYear("todas");setPage(1);}}
        >
          Todas
        </button>
        <form onSubmit={event=>{event.preventDefault();const value=String(new FormData(event.currentTarget).get('year'));if(/^\d{4}$/.test(value)){setYear(value);setPage(1);}}} style={{display:'flex',gap:8,alignItems:'center'}}>
          <label htmlFor="connection-year">Ano</label><input id="connection-year" name="year" type="number" min="1000" max="9999" placeholder="2026" required style={{width:90,padding:8}}/>
          <button className="btn-filtro" type="submit">Filtrar ano</button>
        </form>
        </div>
      </ScrollReveal>
      {loading && <p role="status">Carregando edições…</p>}
      {error && <p role="alert">{error} <button className="btn btn-contorno" onClick={()=>setRevision(value=>value+1)}>Tentar novamente</button></p>}
      {!loading && !error && latest && (
        <ScrollReveal className="conexao-reveal-destaque reveal-esquerda">
          <article
            className="card-conexao-destaque"
            onClick={event => openCard(latest, event)}
          >
            <div className="card-destaque-foto">
              <span className="tag-mais-recente">{latest.featured ? "Em destaque" : "Mais recente"}</span>
              <div className="conexao-carrossel-interativo" onClick={(e) => e.stopPropagation()}>
                <AboutPhotoCarousel label={`Fotos — ${latest.title}`} slides={slidesFor(latest)} />
              </div>
            </div>
            <div className="card-destaque-corpo">
            <span className="rotulo">Edição em destaque</span>
            <AnimatedTitle as="h2" parts={[{ text: latest.title }]} />
            <span className="tema-tag">
              <Star />
              {latest.theme}
            </span>
            <PreacherInfo connection={latest}/>
            <p>{latest.summary}</p>
            <div className="card-meta">
              <span>
                <Calendar />
                {formatConnectionDate(latest.date)}
              </span>
              {latest.photos.length > 0 && (
                <span>{latest.photos.length} fotos</span>
              )}
            </div>
            <button
              type="button"
              onClick={event => openEdition(latest, event.currentTarget)}
              aria-haspopup="dialog"
              className="btn btn-primario"
              style={{ alignSelf: "flex-start" }}
            >
              Ver pregação completa
            </button>
            </div>
          </article>
        </ScrollReveal>
      )}
      <div className="grade-conexoes">
        {!loading && !error && shown.slice(1).map((c, index) => (
          <ScrollReveal className="conexao-card-reveal" delay={index * 100} key={c.id}>
            <article
              className="card-conexao"
              onClick={event => openCard(c, event)}
            >
              <div className="card-conexao-foto">
                <div className="conexao-carrossel-interativo" onClick={(e) => e.stopPropagation()}>
                  <AboutPhotoCarousel label={`Fotos — ${c.title}`} slides={slidesFor(c)} />
                </div>
              </div>
              <div className="card-conexao-corpo">
              <span className="rotulo">Edição Conexão</span>
              <h3>{c.title}</h3>
              <span className="tema-tag">
                <Star />
                {c.theme}
              </span>
              <p>{c.summary}</p>
              <div className="card-conexao-rodape">
                <div className="card-meta">
                  <span>
                    <Calendar />
                    {formatConnectionDate(c.date)}
                  </span>
                </div>
                <button
                  type="button"
                  className="conexao-ler-mais"
                  onClick={event => openEdition(c, event.currentTarget)}
                  aria-haspopup="dialog"
                >
                  Ler mais →
                </button>
              </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
      {!loading && !error && !shown.length && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--espresso-60)",
          }}
        >
          <p style={{ fontSize: "1.05rem" }}>Nenhuma edição publicada ainda.</p>
          <p>
            Acompanhe nossas redes sociais para saber quando a próxima Conexão
            acontece!
          </p>
        </div>
      )}
      {!loading && !error && total>12 && <nav aria-label="Páginas das edições" style={{display:'flex',justifyContent:'center',gap:16,marginTop:24}}><button className="btn btn-contorno" disabled={page===1} onClick={()=>setPage(page-1)}>Anterior</button><span>{page} / {Math.ceil(total/12)}</span><button className="btn btn-contorno" disabled={page*12>=total} onClick={()=>setPage(page+1)}>Próxima</button></nav>}
      <dialog
        ref={modal}
        className={`modal-conexao-overlay ${closing ? "fechando" : ""}`}
        aria-label={selected?.title || 'Edição Conexão'}
        onCancel={event => { event.preventDefault(); closeEdition(); }}
        onClick={event => { if (event.currentTarget === event.target) closeEdition(); }}
      >
        {selected && (
          <div className="modal-conexao">
            <div className="modal-conexao-foto">
              <AboutPhotoCarousel label={`Galeria — ${selected.title}`} slides={slidesFor(selected)} />
              <button
                className="modal-conexao-fechar"
                type="button"
                onClick={closeEdition}
                aria-label="Fechar"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-conexao-corpo">
              <span className="rotulo">
                Edição Conexão · {formatConnectionDate(selected.date)}
              </span>
              <AnimatedTitle as="h2" parts={[{ text: selected.title }]} />
              <span
                className="tema-tag"
                style={{ display: "inline-flex", marginBottom: 6 }}
              >
                <Star />
                {selected.theme}
              </span>
              <PreacherInfo connection={selected}/>
              <div
                className="conteudo-pregacao"
                style={{whiteSpace:"pre-wrap"}}
              >{selected.content}</div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
