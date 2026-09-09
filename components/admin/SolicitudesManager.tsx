"use client";

import { useState } from "react";
import { SolicitudesTable } from "@/components/admin/SolicitudesTable";
import { SolicitudDetailModal } from "@/components/admin/SolicitudDetailModal";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import type { Club, SolicitudInscripcion } from "@/types";

interface SolicitudesManagerProps {
  solicitudes: SolicitudInscripcion[];
  clubes: Club[];
}

export function SolicitudesManager({ solicitudes, clubes }: SolicitudesManagerProps) {
  const [seleccionada, setSeleccionada] = useState<SolicitudInscripcion | null>(null);
  const clubesMap = new Map(clubes.map((c) => [c.id, c]));
  const pendientesCount = solicitudes.filter((s) => s.estado === "pendiente").length;

  return (
    <div className="space-y-4">
      <BulkActionsBar pendientesCount={pendientesCount} />
      <SolicitudesTable solicitudes={solicitudes} clubesMap={clubesMap} onSelect={setSeleccionada} />
      <SolicitudDetailModal solicitud={seleccionada} clubes={clubes} onClose={() => setSeleccionada(null)} />
    </div>
  );
}
