"use client";

import { cn } from "@/lib/utils";
import type { Club } from "@/types";

interface ClubSelectCardProps {
  club: Club;
  name: string;
  selected: boolean;
  disabledReason?: string;
  onSelect: () => void;
}

export function ClubSelectCard({ club, name, selected, disabledReason, onSelect }: ClubSelectCardProps) {
  const cupoRestante = club.capacidadMaxima - club.miembrosActuales.length;
  const disabled = Boolean(disabledReason);

  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-5 transition-all",
        selected
          ? "border-red-300 bg-brand/5 ring-2 ring-brand dark:border-red-800 dark:bg-red-950/20"
          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700",
        disabled && "cursor-not-allowed opacity-50 hover:border-neutral-200 dark:hover:border-neutral-800",
      )}
    >
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
      />
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-tight text-neutral-950 dark:text-white">{club.nombre}</h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            cupoRestante > 0
              ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-gray-300"
              : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
          )}
        >
          {cupoRestante > 0 ? `${cupoRestante} cupos` : "Sin cupo"}
        </span>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-gray-400">{club.descripcion}</p>
      {disabledReason && <p className="text-xs font-medium text-red-500 dark:text-red-400">{disabledReason}</p>}
    </label>
  );
}
