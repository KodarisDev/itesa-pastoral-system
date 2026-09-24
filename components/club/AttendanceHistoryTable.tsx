"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SesionEnriquecida } from "@/lib/reportes/asistencia";

interface AttendanceHistoryTableProps {
  sesiones: SesionEnriquecida[];
}

export function AttendanceHistoryTable({ sesiones }: AttendanceHistoryTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const enRango = sesiones.filter((s) => (!desde || s.fecha >= desde) && (!hasta || s.fecha <= hasta));
    if (!q) return enRango;
    return enRango
      .map((sesion) => ({
        ...sesion,
        registros: sesion.registros.filter((r) => `${r.nombreCompleto} ${r.matricula}`.toLowerCase().includes(q)),
      }))
      .filter((sesion) => sesion.registros.length > 0);
  }, [sesiones, busqueda, desde, hasta]);

  if (sesiones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Todavía no se ha registrado ninguna asistencia.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="filtro-estudiante" className="text-xs">
            Buscar estudiante
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <Input
              id="filtro-estudiante"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre o matrícula"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="filtro-desde" className="text-xs">
            Desde
          </Label>
          <Input id="filtro-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="filtro-hasta" className="text-xs">
            Hasta
          </Label>
          <Input id="filtro-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
          No se encontró asistencia para estos filtros.
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
