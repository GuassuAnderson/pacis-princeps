/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.classList.add("preloader-ativo");

    const timer = window.setTimeout(() => {
      setVisible(false);
      document.body.classList.remove("preloader-ativo");
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("preloader-ativo");
    };
  }, []);

  return (
    <div
      className={`preloader ${visible ? "preloader-visivel" : "preloader-saindo"}`}
      aria-hidden={!visible}
      aria-label="Carregando Pacis Princeps"
    >
      <div className="preloader-arcos" />
      <div className="preloader-conteudo preloader-conteudo-texto">
        <svg className="preloader-ovelha-svg" viewBox="0 0 180 138" role="img" aria-label="Ovelha desenhada em traços acenando">
          <g className="preloader-ovelha-corpo">
            <path className="preloader-ovelha-preenchimento" d="M42 91c-12-3-17-17-10-27-5-11 3-24 16-24 3-13 19-19 30-11 9-12 29-11 37 2 12-7 28 1 29 15 13 3 18 20 8 30 4 13-8 25-21 23H56c-13 1-23-10-20-22 2 1 4 1 6 0Z" />
            <path className="preloader-ovelha-traco preloader-ovelha-contorno" d="M42 91c-12-3-17-17-10-27-5-11 3-24 16-24 3-13 19-19 30-11 9-12 29-11 37 2 12-7 28 1 29 15 13 3 18 20 8 30 4 13-8 25-21 23H56c-13 1-23-10-20-22 2 1 4 1 6 0Z" />
            <path className="preloader-ovelha-traco preloader-ovelha-detalhe" d="M47 48c5 5 11 5 16 0 5 6 12 6 17 0m35-8c5 6 12 7 18 2M39 73c6 4 12 3 16-2m70 23c6 2 11 0 15-4" />
          </g>
          <g className="preloader-ovelha-cabeca">
            <path className="preloader-ovelha-rosto" d="M67 49c3-13 13-22 25-22s22 9 25 22v26c-2 17-13 28-25 28S69 92 67 75V49Z" />
            <path className="preloader-ovelha-traco" d="M67 49c3-13 13-22 25-22s22 9 25 22v26c-2 17-13 28-25 28S69 92 67 75V49Z" />
            <path className="preloader-ovelha-traco preloader-ovelha-orelha" d="M68 53c-13-9-25-4-25 8 8 6 17 5 25-1m48-7c13-9 25-4 25 8-8 6-17 5-25-1" />
            <path className="preloader-ovelha-traco preloader-ovelha-detalhe" d="M70 43c4 5 9 6 14 2 4 6 11 6 15 0 5 5 10 4 14-2M83 79c5 4 13 4 18 0" />
            <circle className="preloader-ovelha-olho preloader-ovelha-olho-esquerdo" cx="82" cy="65" r="2.6" />
            <circle className="preloader-ovelha-olho preloader-ovelha-olho-direito" cx="102" cy="65" r="2.6" />
            <path className="preloader-ovelha-piscada" d="M98 66q4 4 8 0" />
            <path className="preloader-ovelha-traco preloader-ovelha-focinho" d="M89 70l3 3 3-3m-3 3v5" />
          </g>
          <g className="preloader-patinha preloader-patinha-esquerda"><path className="preloader-ovelha-traco" d="M62 93c-5 11-6 24-4 36m15-35c-2 12-2 24 0 35m-16 0h17" /></g>
          <g className="preloader-patinha preloader-patinha-direita"><path className="preloader-ovelha-traco" d="M112 94c2 12 2 24 0 35m14-36c5 11 6 24 4 36m-19 0h20" /></g>
          <g className="preloader-patinha-aceno"><path className="preloader-ovelha-traco" d="M124 88c9-4 14-13 13-24m0 1c-1-7 8-9 11-3 2 4-1 8-5 9m-6-7c4 2 7 5 8 9" /></g>
          <path className="preloader-brilho-ovelha" d="M151 45l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
        </svg>
        <div className="preloader-iniciais" aria-hidden="true">
          <span>P</span>
          <i>✦</i>
          <span>P</span>
        </div>
        <p>Pacis Princeps</p>
        <div className="preloader-linha" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
