"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PhotoPlaceholder } from "@/components/photo-placeholder";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sobre-reveal ${visible ? "sobre-reveal-visivel" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export type AboutSlide = {
  title: string;
  subtitle?: string;
  src?: string;
  alt?: string;
};

export function AboutPhotoCarousel({ slides, label }: { slides: AboutSlide[]; label: string }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const select = (index: number) => setCurrent((index + slides.length) % slides.length);

  return (
    <div
      className="sobre-carrossel"
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        if (Math.abs(distance) > 45) select(current + (distance < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="sobre-carrossel-trilho" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide, index) => (
          <div
            className="sobre-carrossel-slide"
            aria-hidden={index !== current}
            key={`${slide.title}-${index}`}
          >
            {slide.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.src} alt={slide.alt ?? slide.title} />
            ) : (
              <PhotoPlaceholder title={slide.title} subtitle={slide.subtitle} />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button className="sobre-carrossel-seta anterior" type="button" onClick={() => select(current - 1)} aria-label="Foto anterior">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button className="sobre-carrossel-seta proxima" type="button" onClick={() => select(current + 1)} aria-label="Próxima foto">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <div className="sobre-carrossel-indicadores" aria-label="Selecionar foto">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={`${slide.title}-indicador`}
                className={index === current ? "ativo" : ""}
                onClick={() => select(index)}
                aria-label={`Ir para foto ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>
          <span className="sobre-carrossel-contador" aria-live="polite">{current + 1} / {slides.length}</span>
        </>
      )}
    </div>
  );
}
