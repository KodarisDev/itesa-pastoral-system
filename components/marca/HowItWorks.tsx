"use client";

import { ClipboardEdit, ListChecks, MailCheck } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/marca/FadeIn";
import { CtaButton } from "@/components/marca/CtaButton";

const PASOS = [
  {
    numero: "1",
    icon: ListChecks,
    titulo: "Elige tu club",
    descripcion: "Explora los clubes disponibles y selecciona el que más te interese, más uno alternativo por si acaso.",
  },
  {
    numero: "2",
    icon: ClipboardEdit,
    titulo: "Envía tu solicitud",
    descripcion: "Completa el formulario con tus datos: nombre, curso y matrícula. Solo toma un minuto.",
  },
  {
    numero: "3",
    icon: MailCheck,
    titulo: "Recibe tu confirmación",
    descripcion: "El encargado de pastoral revisa tu solicitud y te asigna a tu club deseado o al alternativo si está lleno.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:bg-neutral-800 dark:text-gray-400">
          Cómo funciona
        </p>
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          Inscribirte toma tres pasos
        </h2>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {PASOS.map((paso) => (
          <StaggerItem key={paso.numero}>
            <div className="flex h-full flex-col">
              <div
                className="relative mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse 100% 80% at 30% 20%, color-mix(in srgb, var(--brand-accent) 16%, transparent), transparent), #fafafa",
                }}
              >
                <paso.icon className="h-12 w-12 text-brand/50" aria-hidden="true" strokeWidth={1.25} />
                <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white shadow-md">
                  {paso.numero}
                </span>
              </div>
              <h3 className="text-lg font-semibold leading-tight text-neutral-950 dark:text-white">{paso.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-gray-400">{paso.descripcion}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="mt-14 flex justify-center">
        <CtaButton href="/inscripcion">Comienza tu inscripción</CtaButton>
      </div>
    </section>
  );
}
