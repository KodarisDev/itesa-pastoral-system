import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { HistorialClub } from "@/types";

const MOTIVO_LABEL: Record<string, string> = {
  nuevo_ciclo: "Nuevo ciclo del club",
  nuevo_anio_escolar: "Nuevo año escolar",
};

export function StudentHistoryTimeline({ historial }: { historial: HistorialClub[] }) {
  if (historial.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Este estudiante todavía no tiene historial de clubes anteriores.
      </div>
    );
  }

  return (
    <ol className="space-y-4 border-l border-gray-200 pl-5 dark:border-neutral-800">
      {historial.map((h) => (
        <li key={h.id} className="relative">
          <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-neutral-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">{h.clubNombre}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(h.fechaInicio), "d MMM yyyy", { locale: es })} —{" "}
            {format(new Date(h.fechaFin), "d MMM yyyy", { locale: es })} · Ciclo #{h.cicloNumero} · Año{" "}
            {h.anioEscolar}
          </p>
          <Badge variant="outline" className="mt-1">
            {MOTIVO_LABEL[h.motivoArchivo] ?? h.motivoArchivo}
          </Badge>
        </li>
      ))}
    </ol>
  );
}
