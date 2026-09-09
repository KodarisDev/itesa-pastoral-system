"use client";

import { Cpu, Dumbbell, Images, Mic2, Music, Palette, Users } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/marca/FadeIn";

const FOTOS = [
  { icon: Users, etiqueta: "Encuentro semanal", span: "col-span-2 row-span-2" },
  { icon: Music, etiqueta: "Coro y Música", span: "" },
  { icon: Mic2, etiqueta: "Debate y Oratoria", span: "" },
  { icon: Palette, etiqueta: "Arte y Pintura", span: "" },
  { icon: Dumbbell, etiqueta: "Voleibol", span: "" },
  { icon: Cpu, etiqueta: "Robótica", span: "col-span-2" },
];

const GRADIENTS = [
  "linear-gradient(135deg, #c0392b, #7f0000)",
  "linear-gradient(135deg, #922b21, #4a1210)",
  "linear-gradient(135deg, #7f0000, #2b0a0a)",
];

export function Gallery() {
  return (
    <section id="galeria" className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:bg-neutral-800 dark:text-gray-400">
          <Images className="h-3.5 w-3.5" aria-hidden="true" />
          Galería
        </p>
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          Momentos de nuestros clubes
        </h2>
        <p className="mt-3 text-balance text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
          Un vistazo a las actividades semanales de la comunidad de Pastoral. Espacio reservado para fotos reales de
          cada club.
        </p>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 md:auto-rows-[150px] md:grid-cols-4">
        {FOTOS.map((foto, i) => (
          <StaggerItem key={foto.etiqueta} className={foto.span}>
            <div
              className="group relative flex h-full min-h-[150px] w-full items-end overflow-hidden rounded-3xl"
              style={{ background: GRADIENTS[i % GRADIENTS.length] }}
            >
              <foto.icon
                className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white/25 transition-transform duration-500 group-hover:scale-110"
                aria-hidden="true"
                strokeWidth={1.25}
              />
              <span className="relative z-10 w-full bg-gradient-to-t from-black/50 to-transparent px-4 py-3 text-sm font-medium text-white">
                {foto.etiqueta}
              </span>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
