"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { SubclubesManager } from "@/components/shared/SubclubesManager";
import type { Club, EncargadoSubclub, Estudiante, Subclub } from "@/types";

interface SubclubesPanelProps {
  clubes: Club[];
  /** Estudiantes con club (los miembros de cada club). */
  estudiantes: Estudiante[];
  subclubes: Subclub[];
  encargadosSubclub: EncargadoSubclub[];
  usuariosEncargados: { id_usuario: number; nombre: string }[];
}

/**
 * Pestaña "Subclubes" del módulo de Clubes: el combobox ocupa el lugar de la
 * barra de búsqueda y debajo aparecen los subclubes del club elegido para
 * crear, renombrar, eliminar y asignar encargados y miembros.
 */
export function SubclubesPanel({ clubes, estudiantes, subclubes, encargadosSubclub, usuariosEncargados }: SubclubesPanelProps) {
  const [clubId, setClubId] = useState<number | null>(null);

  const subclubesPorClub = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const s of subclubes) mapa.set(s.id_club, (mapa.get(s.id_club) ?? 0) + 1);
    return mapa;
  }, [subclubes]);

  const subclubesDelClub = clubId === null ? [] : subclubes.filter((s) => s.id_club === clubId);
  const idsSubclubes = new Set(subclubesDelClub.map((s) => s.id_subclub));

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm">
        <Label htmlFor="subclubes-club" className="text-xs">
          Buscar club
        </Label>
        <SearchableSelect
          id="subclubes-club"
          options={clubes.map((c) => {
            const n = subclubesPorClub.get(c.id_club) ?? 0;
            return { value: String(c.id_club), label: c.nombre, hint: n > 0 ? `${n} subclub${n === 1 ? "" : "es"}` : undefined };
          })}
          value={clubId === null ? null : String(clubId)}
          onChange={(v) => setClubId(Number(v))}
          placeholder="Selecciona un club…"
          searchPlaceholder="Buscar club…"
          emptyText="Ningún club coincide."
        />
      </div>

      {clubId === null ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
          Selecciona un club para ver y administrar sus subclubes.
        </div>
      ) : (
        <SubclubesManager
          key={clubId}
          clubId={clubId}
          subclubes={subclubesDelClub}
          miembros={estudiantes.filter((e) => e.id_club === clubId)}
          encargadosSubclub={encargadosSubclub.filter((e) => idsSubclubes.has(e.id_subclub))}
          usuarios={usuariosEncargados}
        />
      )}
    </div>
  );
}
