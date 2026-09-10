import Image from "next/image";
import type { CSSProperties } from "react";

const moments = [
  {
    src: "/images/equipe/fundadores-3.webp",
    alt: "Fundadores da PACIS no espaço da loja",
    position: "center 58%",
  },
  {
    src: "/images/nossa-historia/nosso-proposito/proposito-6.jpg",
    alt: "Devoção a Nossa Senhora de Fátima",
    position: "center 34%",
  },
  {
    src: "/images/equipe/time-pacis-1.webp",
    alt: "Amigos da PACIS reunidos em comunidade",
    position: "center 42%",
  },
  {
    src: "/images/nossa-historia/nosso-proposito/proposito-2.jpg",
    alt: "Encontro da PACIS em evento católico",
    position: "center 35%",
  },
  {
    src: "/images/nossa-historia/nosso-proposito/proposito-3.jpg",
    alt: "Comunidade PACIS reunida",
    position: "center 54%",
  },
  {
    src: "/images/nossa-historia/nosso-proposito/proposito-1.jpg",
    alt: "Família PACIS em uma confraternização",
    position: "center 72%",
  },
];

export function AboutStoryWindow() {
  return (
    <div className="historia-vitrais" aria-label="Momentos da história da PACIS Princeps">
      <div className="historia-vitrais-luz" aria-hidden="true" />

      <div className="historia-vitrais-filme">
        {moments.map((moment, index) => (
          <figure
            className="historia-vitrais-cena"
            key={moment.src}
            style={{ "--cena-atraso": `${index * 2.35}s` } as CSSProperties}
          >
            <Image
              fill
              src={moment.src}
              alt={moment.alt}
              sizes="(max-width: 900px) 360px, 42vw"
              style={{ objectPosition: moment.position }}
              priority={index === 0}
            />
          </figure>
        ))}

        <div className="historia-vitrais-marca">
          <div className="historia-vitrais-estrelas" aria-hidden="true">
            {Array.from({ length: 11 }, (_, index) => <span key={index}>✦</span>)}
          </div>
          <Image
            src="/images/logo.png"
            alt="Pacis Princeps — Artigos Religiosos"
            width={760}
            height={464}
            sizes="(max-width: 900px) 300px, 36vw"
          />
          <p>Fé que acolhe. Missão que permanece.</p>
        </div>
      </div>

      <div className="historia-vitrais-tracery" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="historia-vitrais-selo">Desde 2023</span>
    </div>
  );
}
