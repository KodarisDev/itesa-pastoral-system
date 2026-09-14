"use client";

import { useState } from "react";
import { ClubsTable } from "@/components/admin/ClubsTable";
import { ClubDetailModal } from "@/components/admin/ClubDetailModal";
import type { Club, Encargado, Estudiante, Usuario } from "@/types";

interface ClubsManagerProps {
  clubes: Club[];
  usuarios: Usuario[];
  encargados: Encargado[];
  estudiantes: Estudiante[];
}

export function ClubsManager({ clubes, usuarios, encargados, estudiantes }: ClubsManagerProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  const principalPorClub = new Map<number, string>();
  const principalIdPorClub = new Map<number, number>();
  const secundarioIdPorClub = new Map<number, number>();
  const miembrosPorClub = new Map<number, number>();
  for (const e of encargados) {
    if (e.encargado_principal) {
      const nombre = usuariosMap.get(e.id_usuario)?.nombre;
      if (nombre) principalPorClub.set(e.id_club, nombre);
      principalIdPorClub.set(e.id_club, e.id_usuario);
    } else {
      secundarioIdPorClub.set(e.id_club, e.id_usuario);
    }
  }
  for (const est of estudiantes) {
    if (est.id_club == null) continue;
    miembrosPorClub.set(est.id_club, (miembrosPorClub.get(est.id_club) ?? 0) + 1);
  }

  const club = clubes.find((c) => c.id_club === selectedId) ?? null;
  const encargadosDelClub = club
    ? encargados
        .filter((e) => e.id_club === club.id_club)
        .map((e) => ({ ...e, usuarioNombre: usuariosMap.get(e.id_usuario)?.nombre ?? "—" }))
    : [];
  const miembros = club ? estudiantes.filter((e) => e.id_club === club.id_club) : [];

  return (
    <>
      <ClubsTable
        clubes={clubes}
        encargadosDisponibles={usuarios}
        principalPorClub={principalPorClub}
        principalIdPorClub={principalIdPorClub}
        secundarioIdPorClub={secundarioIdPorClub}
        miembrosPorClub={miembrosPorClub}
        onSelect={(c) => setSelectedId(c.id_club)}
      />
      <ClubDetailModal club={club} encargados={encargadosDelClub} miembros={miembros} onClose={() => setSelectedId(null)} />
    </>
  );
}
