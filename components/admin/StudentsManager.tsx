"use client";

import { useState } from "react";
import { StudentsTable } from "@/components/admin/StudentsTable";
import { StudentDetailModal } from "@/components/admin/StudentDetailModal";
import type { Estudiante, HistorialClub } from "@/types";

interface StudentsManagerProps {
  estudiantes: Estudiante[];
  clubPorEstudiante: Map<string, string>;
  historial: HistorialClub[];
  initialMatricula?: string;
}

export function StudentsManager({ estudiantes, clubPorEstudiante, historial, initialMatricula }: StudentsManagerProps) {
  const initial = initialMatricula ? (estudiantes.find((e) => e.matricula === initialMatricula) ?? null) : null;
  const [selectedId, setSelectedId] = useState<string | null>(initial?.id ?? null);

  const estudiante = estudiantes.find((e) => e.id === selectedId) ?? null;
  const historialEstudiante = estudiante
    ? historial
        .filter((h) => h.estudianteId === estudiante.id)
        .sort((a, b) => b.fechaFin.localeCompare(a.fechaFin))
    : [];

  return (
    <>
      <StudentsTable estudiantes={estudiantes} clubPorEstudiante={clubPorEstudiante} onSelect={(e) => setSelectedId(e.id)} />
      <StudentDetailModal
        estudiante={estudiante}
        clubActualNombre={estudiante ? (clubPorEstudiante.get(estudiante.id) ?? null) : null}
        historial={historialEstudiante}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
