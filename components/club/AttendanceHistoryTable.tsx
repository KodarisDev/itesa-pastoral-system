import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { Estudiante, SesionAsistencia } from "@/types";

interface AttendanceHistoryTableProps {
  sesiones: SesionAsistencia[];
  estudiantesMap: Map<string, Estudiante>;
}

export function AttendanceHistoryTable({ sesiones, estudiantesMap }: AttendanceHistoryTableProps) {
  if (sesiones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Todavía no se ha registrado ninguna asistencia.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sesiones.map((sesion) => {
        const presentes = sesion.registros.filter((r) => r.presente).length;
        return (
          <details key={sesion.id} className="group rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {format(new Date(sesion.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })}
              </span>
              <Badge variant={presentes === sesion.registros.length ? "success" : "secondary"}>
                {presentes} / {sesion.registros.length} presentes
              </Badge>
            </summary>
            <div className="divide-y divide-gray-100 border-t border-gray-100 px-4 dark:divide-neutral-800 dark:border-neutral-800">
              {sesion.registros.map((r) => {
                const estudiante = estudiantesMap.get(r.estudianteId);
                return (
                  <div key={r.estudianteId} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : r.estudianteId}
                    </span>
                    <Badge variant={r.presente ? "success" : "destructive"}>
                      {r.presente ? "Presente" : "Ausente"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
