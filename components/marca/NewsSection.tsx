"use client";

import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/marca/FadeIn";
import { NOTICIAS } from "@/content/noticias";

export function NewsSection() {
  return (
    <section id="noticias" className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:bg-neutral-800 dark:text-gray-400">
          <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
          Noticias
        </p>
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          Lo último del área de Pastoral
        </h2>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {NOTICIAS.map((n) => (
          <StaggerItem key={n.slug}>
            <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-100 dark:border-neutral-800">
              <Link
                href={`/noticias/${n.slug}`}
                className="relative flex aspect-[16/9] items-center justify-center"
                style={{
                  background:
                    "radial-gradient(ellipse 100% 80% at 30% 20%, color-mix(in srgb, var(--brand-accent) 18%, transparent), transparent), #fafafa",
                }}
              >
                <n.icono className="h-10 w-10 text-brand/50" aria-hidden="true" strokeWidth={1.25} />
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-brand">
                  <span>{n.categoria}</span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span className="text-neutral-400 dark:text-gray-500">{n.fecha}</span>
                </div>
                <h3 className="text-[15px] font-semibold leading-snug text-neutral-950 dark:text-white">
                  <Link href={`/noticias/${n.slug}`} className="hover:underline">
                    {n.titulo}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500 dark:text-gray-400">{n.resumen}</p>
                <Link
                  href={`/noticias/${n.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
                >
                  Leer más
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
