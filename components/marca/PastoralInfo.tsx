"use client";

import { useState } from "react";
import { CalendarCheck, ClipboardList, HeartHandshake, History, Images, Users } from "lucide-react";
import { FadeIn } from "@/components/marca/FadeIn";
import { cn } from "@/lib/utils";

type Audiencia = "estudiantes" | "encargados";

const CONTENIDO: Record<Audiencia, { icon: typeof Users; titulo: string; descripcion: string }[]> = {
  estudiantes: [
    {
      icon: Users,
      titulo: "Un club para cada estudiante",
      descripcion:
        "Todo estudiante del instituto participa en un club durante la hora curricular, con cupos claros y un encargado responsable de acompañarlo.",
    },
    {
      icon: Images,
      titulo: "Fotos y noticias de tu club",
      descripcion:
        "Revisa la galería y las últimas noticias de la comunidad de Pastoral, con lo que va pasando en cada club.",
    },
    {
      icon: CalendarCheck,
      titulo: "Encuentro todos los miércoles",
      descripcion:
        "Cada semana te reúnes con tu grupo durante la hora curricular para desarrollar talentos, valores y sentido de comunidad.",
    },
  ],
  encargados: [
    {
      icon: ClipboardList,
      titulo: "Pase de lista semanal",
      descripcion:
        "Registra presentes y ausentes de tu club en segundos desde cualquier dispositivo, cada miércoles de sesión.",
    },
    {
      icon: HeartHandshake,
      titulo: "Gestión de miembros",
      descripcion:
        "Consulta el listado de tu grupo, sus datos de contacto y su curso, todo centralizado en un solo panel.",
    },
    {
      icon: History,
      titulo: "Historial por ciclo",
      descripcion:
        "Lleva el registro de asistencia de cada ciclo del club y consulta el histórico de años escolares anteriores.",
    },
  ],
};

export function PastoralInfo() {
  const [audiencia, setAudiencia] = useState<Audiencia>("estudiantes");
  const items = CONTENIDO[audiencia];

  return (
    <section id="nosotros" className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
          <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
          Qué es Pastoral
        </p>
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950">
          Formación más allá del aula
        </h2>
        <p className="mt-3 text-balance text-sm leading-relaxed text-neutral-500">
          El área de Pastoral organiza los clubes del instituto: espacios de una hora a la semana donde los
          estudiantes desarrollan talentos, valores y sentido de comunidad junto a un encargado —estudiante o
          profesor— que guía al grupo.
        </p>
      </FadeIn>

      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full bg-neutral-100 p-1">
          {(
            [
              { key: "estudiantes", label: "Para estudiantes" },
              { key: "encargados", label: "Para encargados" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setAudiencia(tab.key)}
              aria-pressed={audiencia === tab.key}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                audiencia === tab.key ? "bg-white text-brand shadow-sm" : "text-neutral-500 hover:text-neutral-800",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-neutral-100 sm:grid-cols-3 sm:divide-x sm:divide-neutral-100">
        {items.map((item, i) => (
          <div key={item.titulo} className={cn("p-8 sm:p-9", i > 0 && "border-t border-neutral-100 sm:border-t-0")}>
            <span className="mb-5 block text-4xl font-bold text-neutral-100">{String(i + 1).padStart(2, "0")}</span>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold leading-tight text-neutral-950">{item.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
