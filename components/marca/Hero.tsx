"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, GraduationCap, HeartHandshake, Shapes, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_ICONS = [Users, HeartHandshake, Shapes, Sparkles, GraduationCap];
const FALLBACK_SLIDES = ["Coro y Música", "Debate y Oratoria", "Arte y Pintura", "Robótica"];

const DOT_PATTERN = "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1.5px)";

interface HeroProps {
  clubNames?: string[];
}

function DuotonePhoto({
  src,
  alt,
  priority,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover grayscale contrast-[1.1]"
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(150deg, rgba(192,57,43,.88), rgba(127,0,0,.92))",
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: DOT_PATTERN, backgroundSize: "14px 14px" }}
        aria-hidden="true"
      />
    </div>
  );
}

export function Hero({ clubNames }: HeroProps) {
  const slides = clubNames && clubNames.length > 0 ? clubNames.slice(0, 5) : FALLBACK_SLIDES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  const Icon = SLIDE_ICONS[index % SLIDE_ICONS.length];

  const goTo = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);

  return (
    <section id="inicio" className="scroll-mt-20 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div
          className="relative isolate overflow-hidden rounded-[2rem] sm:rounded-[2.75rem] lg:flex lg:items-center"
          style={{ background: "linear-gradient(135deg, #c0392b 0%, #922b21 55%, #7f0000 100%)" }}
        >
          {/* Textura de fondo — círculos suaves, imitan el patrón institucional del hero de referencia */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.15]" aria-hidden="true">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white" />
            <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full border-[40px] border-white" />
          </div>

          {/* Imagen — versión mobile: una sola foto con logo superpuesto, como la referencia */}
          <div className="relative z-10 mx-6 mt-6 aspect-[16/11] overflow-hidden rounded-[1.5rem] sm:mx-10 sm:mt-10 lg:hidden">
            <DuotonePhoto
              src="https://images.unsplash.com/photo-1546957221-37816b007052?auto=format&fit=crop&w=900&q=75"
              alt="Estudiantes del instituto participando en actividades de Pastoral"
              priority
              sizes="100vw"
              className="h-full w-full"
            />
            <Image
              src="/logo.webp"
              alt="Logo del instituto"
              width={52}
              height={52}
              className="absolute left-5 top-5 rounded-full ring-2 ring-white/60"
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-lg dark:bg-neutral-900/95">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                </AnimatePresence>
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-widest text-neutral-400 dark:text-gray-500">
                  Club destacado
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="truncate text-xs font-semibold text-neutral-950 dark:text-white"
                  >
                    {slides[index]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Columna de texto */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:w-[54%] lg:px-16 lg:py-20"
          >
            <Image
              src="/logo.webp"
              alt="Logo del instituto"
              width={64}
              height={64}
              className="mb-6 rounded-full ring-2 ring-white/40"
            />

            <h1 className="text-balance text-[clamp(1.7rem,4.6vw,3.4rem)] font-bold leading-[1.08] tracking-tight text-white">
              Cada estudiante, un club. Cada club, una comunidad.
            </h1>
            <p className="mt-4 max-w-xl text-balance text-[13.5px] leading-relaxed text-white/85 sm:text-[15px] lg:mt-5">
              El área de Pastoral acompaña a cada estudiante del instituto en un club durante la hora curricular.
              Inscríbete en el que más te guste, y si eres encargado, lleva el control de tu grupo en un solo
              lugar.
            </p>
            <div className="mt-6 lg:mt-9">
              <a
                href="/inscripcion"
                className="inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand transition-colors hover:bg-white/90"
              >
                Inscribirme a un club
              </a>
            </div>

            {/* Flechas del carrusel — solo mobile, en desktop viven sobre el collage */}
            <div className="mt-5 flex justify-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Club anterior"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Siguiente club"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Indicadores del carrusel */}
            <div className="mt-4 flex justify-center gap-2 lg:mt-10 lg:justify-start">
              {slides.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ver club ${s}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/40",
                  )}
                />
              ))}
            </div>
          </motion.div>

          {/* Columna derecha — collage de fotos, solo desktop */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="relative z-10 hidden shrink-0 items-center justify-center p-10 lg:flex lg:w-[46%] lg:self-stretch"
          >
            <div className="relative aspect-[6/5] w-full max-w-md">
              <DuotonePhoto
                src="https://images.unsplash.com/photo-1546957221-37816b007052?auto=format&fit=crop&w=900&q=75"
                alt="Estudiantes del instituto en una actividad grupal de Pastoral"
                sizes="(min-width: 1024px) 30vw, 0px"
                className="absolute left-0 top-0 h-[68%] w-[64%] rounded-[1.75rem] ring-1 ring-white/20"
              />
              <DuotonePhoto
                src="https://images.unsplash.com/photo-1555734521-b104e271023f?auto=format&fit=crop&w=800&q=75"
                alt="Grupo de estudiantes sonriendo tras una actividad de club"
                sizes="(min-width: 1024px) 26vw, 0px"
                className="absolute bottom-0 right-0 h-[58%] w-[58%] rounded-[1.75rem] ring-1 ring-white/20"
              />

              {/* Insignia flotante con el club destacado — carrusel real */}
              <div className="absolute left-4 top-1/2 w-[72%] -translate-y-1/2 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:bg-neutral-900/95">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 dark:text-gray-500">
                      Club destacado
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="truncate text-sm font-semibold text-neutral-950 dark:text-white"
                      >
                        {slides[index]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Controles del carrusel */}
              <div className="absolute -bottom-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Club anterior"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition-transform hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Siguiente club"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition-transform hover:scale-105"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
