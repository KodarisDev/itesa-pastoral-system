"use client";

import Link from "next/link";
import { FadeIn } from "@/components/marca/FadeIn";

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto max-w-4xl rounded-[2rem] bg-brand px-8 py-16 text-center sm:rounded-[2.5rem]">
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-white">
          ¿Listo para encontrar tu club?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-balance text-sm leading-relaxed text-white/80">
          Completa el formulario de inscripción y forma parte de la comunidad de Pastoral.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/inscripcion"
            className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-brand transition-colors hover:bg-white/90"
          >
            Inscribirme ahora
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
