"use client";

import { useState } from "react";
import { StudentsTable } from "@/components/admin/StudentsTable";
import { StudentDetailModal } from "@/components/admin/StudentDetailModal";
import type { Club, Estudiante } from "@/types";

interface StudentsManagerProps {
  estudiantes: Estudiante[];
  clubes: Club[];
  initialMatricula?: string;
}

export function StudentsManager({ estudiantes, clubes, initialMatricula }: StudentsManagerProps) {
  const initial = initialMatricula ? (estudiantes.find((e) => e.matricula === initialMatricula) ?? null) : null;
  const [selectedId, setSelectedId] = useState<number | null>(initial?.id_estudiante ?? null);

  const estudiante = estudiantes.find((e) => e.id_estudiante === selectedId) ?? null;
  const clubNombre = estudiante?.id_club != null ? clubes.find((c) => c.id_club === estudiante.id_club)?.nombre ?? null : null;

  return (
    <>
      <StudentsTable estudiantes={estudiantes} clubes={clubes} onSelect={(e) => setSelectedId(e.id_estudiante)} />
      <StudentDetailModal estudiante={estudiante} clubActualNombre={clubNombre} onClose={() => setSelectedId(null)} />
    </>
  );
}
