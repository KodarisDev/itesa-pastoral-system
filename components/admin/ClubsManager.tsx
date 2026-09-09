"use client";

import { useState } from "react";
import { ClubsTable } from "@/components/admin/ClubsTable";
import { ClubDetailModal } from "@/components/admin/ClubDetailModal";
import type { Club, Estudiante, Usuario } from "@/types";

interface ClubsManagerProps {
  clubes: Club[];
  encargados: Usuario[];
  estudiantes: Estudiante[];
}

export function ClubsManager({ clubes, encargados, estudiantes }: ClubsManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Se deriva de las props (no de un snapshot guardado en estado) para que, tras una
  // acción dentro del modal (iniciar ciclo, quitar miembro) y el router.refresh() que
  // trae datos nuevos, el modal siga abierto pero muestre la información actualizada.
  const club = clubes.find((c) => c.id === selectedId) ?? null;
  const encargado = club?.encargadoUsuarioId ? (encargados.find((u) => u.id === club.encargadoUsuarioId) ?? null) : null;
  const miembros = club ? estudiantes.filter((e) => club.miembrosActuales.includes(e.id)) : [];

  return (
    <>
      <ClubsTable clubes={clubes} encargados={encargados} onSelect={(c) => setSelectedId(c.id)} />
      <ClubDetailModal club={club} encargado={encargado} miembros={miembros} onClose={() => setSelectedId(null)} />
    </>
  );
}
