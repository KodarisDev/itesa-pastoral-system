"use client";

import Image from "next/image";
import Link from "next/link";
import { Shapes } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/marca/FadeIn";
import { CtaButton } from "@/components/marca/CtaButton";
import type { Club } from "@/types";

interface FeaturedClubsProps {
  clubes: Club[];
}

export function FeaturedClubs({ clubes }: FeaturedClubsProps) {
  if (clubes.length === 0) return null;

  return (
    <section id="clubes" className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:bg-neutral-800 dark:text-gray-400">
          Clubes disponibles
        </p>
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          Encuentra el club que va contigo
        </h2>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clubes.map((club) => {
          const cupoRestante = club.capacidadMaxima - club.miembrosActuales.length;
          return (
            <StaggerItem key={club.id}>
              <div className="group flex h-full flex-col gap-3 rounded-3xl border border-neutral-100 p-3 transition-shadow hover:shadow-md dark:border-neutral-800">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  {club.fotoUrl ? (
                    <Image
                      src={club.fotoUrl}
                      alt={club.nombre}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center dark:bg-neutral-900"
                      style={{
                        background:
                          "radial-gradient(ellipse 100% 80% at 50% 0%, color-mix(in srgb, var(--brand-accent) 22%, transparent), transparent), #fafafa",
                      }}
                    >
                      <Shapes className="h-10 w-10 text-brand/40" aria-hidden="true" />
                    </div>
                  )}
                  <span
                    className={
                      "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md dark:bg-neutral-900/80 " +
                      (cupoRestante > 0 ? "bg-white/90 text-neutral-700 dark:text-gray-300" : "bg-white/90 text-red-600 dark:text-red-400")
                    }
                  >
                    {cupoRestante > 0 ? `${cupoRestante} cupos` : "Sin cupo"}
                  </span>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="text-[15px] font-semibold leading-tight text-neutral-950 dark:text-white">{club.nombre}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-gray-400">{club.descripcion}</p>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <div className="mt-12 flex justify-center">
        <CtaButton href="/inscripcion">Ver todos e inscribirme</CtaButton>
      </div>
    </section>
  );
}
