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
