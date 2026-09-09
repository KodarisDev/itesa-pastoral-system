"use client";

import { CalendarCheck, ClipboardCheck, Clock, HeartHandshake, Sparkles, Users } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/marca/FadeIn";
import { cn } from "@/lib/utils";

interface StatsSectionProps {
  totalClubes: number;
  totalEstudiantesActivos: number;
  totalEncargados: number;
}

type Tone = "brand" | "dark" | "brandDark" | "light" | "tint" | "darker";

const TONE_CLASSES: Record<Tone, string> = {
  brand: "bg-brand text-white",
  dark: "bg-neutral-950 text-white",
  brandDark: "bg-brand-dark text-white",
  darker: "bg-brand-darker text-white",
  light: "bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white",
  tint: "bg-brand/10 text-neutral-950 dark:bg-brand/15 dark:text-white",
};

const ICON_TONE_CLASSES: Record<Tone, string> = {
  brand: "bg-white/15 text-white",
  dark: "bg-white/10 text-white",
  brandDark: "bg-white/15 text-white",
  darker: "bg-white/15 text-white",
  light: "bg-white text-brand dark:bg-neutral-900",
  tint: "bg-white text-brand dark:bg-neutral-900",
};

export function StatsSection({ totalClubes, totalEstudiantesActivos, totalEncargados }: StatsSectionProps) {
  const stats: { icon: typeof Users; value: string; label: string; tone: Tone }[] = [
    { icon: Users, value: String(totalClubes), label: "Clubes activos", tone: "brand" },
    { icon: HeartHandshake, value: String(totalEstudiantesActivos), label: "Estudiantes participando", tone: "dark" },
    { icon: ClipboardCheck, value: String(totalEncargados), label: "Encargados de club", tone: "brandDark" },
    { icon: CalendarCheck, value: "Miércoles", label: "Día de encuentro semanal", tone: "light" },
    { icon: Clock, value: "1 hora", label: "Dedicada cada semana", tone: "tint" },
    { icon: Sparkles, value: "100% en línea", label: "Inscripción sin papeleo", tone: "darker" },
  ];

  return (
    <section id="indicadores" className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:bg-neutral-800 dark:text-gray-400">
          En números
        </p>
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          El área de Pastoral en cifras
        </h2>
        <p className="mt-3 text-balance text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
          Así avanza la comunidad de clubes del instituto durante el ciclo escolar actual.
        </p>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className={cn("flex h-full flex-col justify-between gap-8 rounded-3xl p-6 sm:p-7", TONE_CLASSES[s.tone])}>
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", ICON_TONE_CLASSES[s.tone])}>
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-sm opacity-80">{s.label}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
