"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ESTADO_SOLICITUD_LABEL } from "@/lib/constants";
import type { Club, SolicitudInscripcion } from "@/types";

interface SolicitudesTableProps {
  solicitudes: SolicitudInscripcion[];
  clubesMap: Map<string, Club>;
  onSelect: (solicitud: SolicitudInscripcion) => void;
}

const ESTADO_VARIANT: Record<string, "warning" | "success" | "destructive"> = {
  pendiente: "warning",
  aceptada: "success",
  rechazada: "destructive",
};

export function SolicitudesTable({ solicitudes, clubesMap, onSelect }: SolicitudesTableProps) {
  if (solicitudes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Todavía no ha llegado ninguna solicitud de inscripción.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Club deseado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitudes.map((s) => (
            <TableRow key={s.id} onClick={() => onSelect(s)} className="cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {s.nombre} {s.apellido}
                  </span>
                  {!s.estudianteId && (
                    <span title="Matrícula no encontrada en el listado vigente">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">{s.matricula}</p>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{s.curso}</TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                {clubesMap.get(s.clubDeseadoId)?.nombre ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(s.fecha), "d MMM yyyy, HH:mm", { locale: es })}
              </TableCell>
              <TableCell>
                <Badge variant={ESTADO_VARIANT[s.estado]}>{ESTADO_SOLICITUD_LABEL[s.estado]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
