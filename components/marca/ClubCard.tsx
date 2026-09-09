import Image from "next/image";
import { Shapes } from "lucide-react";
import type { Club } from "@/types";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  const cupoRestante = club.capacidadMaxima - club.miembrosActuales.length;

  return (
    <div className="group flex h-full flex-col gap-3 rounded-3xl border border-neutral-100 p-3 transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
        {club.fotoUrl ? (
          <Image
            src={club.fotoUrl}
            alt={club.nombre}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
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
            "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md " +
            (cupoRestante > 0 ? "bg-white/90 text-neutral-700" : "bg-white/90 text-red-600")
          }
        >
          {cupoRestante > 0 ? `${cupoRestante} cupos` : "Sin cupo"}
        </span>
      </div>
      <div className="px-2 pb-2">
        <h3 className="text-[15px] font-semibold leading-tight text-neutral-950">{club.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500">{club.descripcion}</p>
      </div>
    </div>
  );
}
