"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { SesionEnriquecida } from "@/lib/reportes/asistencia";

interface AttendanceHistoryTableProps {
  sesiones: SesionEnriquecida[];
}

export function AttendanceHistoryTable({ sesiones }: AttendanceHistoryTableProps) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return sesiones;
    return sesiones
      .map((sesion) => ({
        ...sesion,
        registros: sesion.registros.filter((r) => `${r.nombreCompleto} ${r.matricula}`.toLowerCase().includes(q)),
      }))
      .filter((sesion) => sesion.registros.length > 0);
  }, [sesiones, busqueda]);

  if (sesiones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Todavía no se ha registrado ninguna asistencia.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar estudiante por nombre o matrícula"
          className="pl-9"
        />
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
          No se encontró asistencia para ese estudiante.
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((sesion) => (
            <details key={sesion.sesionId} open={busqueda.trim() !== ""} className="group rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(`${sesion.fecha}T00:00:00`), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </span>
                <Badge variant={sesion.presentes === sesion.total ? "success" : "secondary"}>
                  {sesion.presentes} / {sesion.total} presentes
                </Badge>
              </summary>
              <div className="divide-y divide-gray-100 border-t border-gray-100 px-4 dark:divide-neutral-800 dark:border-neutral-800">
                {sesion.registros.map((r) => (
                  <div key={r.estudianteId} className="py-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{r.nombreCompleto}</span>
                      <Badge variant={r.presente ? "success" : "destructive"}>
                        {r.presente ? "Presente" : "Ausente"}
                      </Badge>
                    </div>
                    {!r.presente && r.justificacion && (
                      <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">&ldquo;{r.justificacion}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
