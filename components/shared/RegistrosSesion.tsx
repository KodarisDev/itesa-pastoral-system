import { Badge } from "@/components/ui/badge";
import type { RegistroEnriquecido } from "@/lib/reportes/asistencia";

interface RegistrosSesionProps {
  registros: RegistroEnriquecido[];
  mostrarCurso?: boolean;
}

function FilaRegistro({ r, mostrarCurso }: { r: RegistroEnriquecido; mostrarCurso: boolean }) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-700 dark:text-gray-300">{r.nombreCompleto}</span>
          {mostrarCurso && <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{r.curso}</span>}
        </div>
        <Badge variant={r.presente ? "success" : "destructive"}>{r.presente ? "Presente" : "Ausente"}</Badge>
      </div>
      {!r.presente && r.justificacion && (
        <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">&ldquo;{r.justificacion}&rdquo;</p>
      )}
    </div>
  );
}

/**
 * Lista de asistencia de una sesión (club + fecha). Si el club usa subclubes,
 * separa los registros con un encabezado por subclub ("Sin subclub" primero).
 */
export function RegistrosSesion({ registros, mostrarCurso = false }: RegistrosSesionProps) {
  const hayAlgunSubclub = registros.some((r) => r.subclubId != null);
  if (!hayAlgunSubclub) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {registros.map((r) => (
          <FilaRegistro key={r.estudianteId} r={r} mostrarCurso={mostrarCurso} />
        ))}
      </div>
    );
  }

  const grupos = new Map<number | null, { nombre: string; registros: RegistroEnriquecido[] }>();
  for (const r of registros) {
    const grupo = grupos.get(r.subclubId) ?? { nombre: r.subclubNombre ?? "Sin subclub", registros: [] };
    grupo.registros.push(r);
    grupos.set(r.subclubId, grupo);
  }
  const ordenados = Array.from(grupos.entries()).sort(([idA, a], [idB, b]) => {
    if (idA === null) return -1;
    if (idB === null) return 1;
    return a.nombre.localeCompare(b.nombre);
  });

  return (
    <div className="space-y-3 pb-3">
      {ordenados.map(([id, grupo]) => {
        const presentes = grupo.registros.filter((r) => r.presente).length;
        return (
          <div key={id ?? "sin-subclub"}>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-neutral-800/60">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">{grupo.nombre}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {presentes} / {grupo.registros.length} presentes
              </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {grupo.registros.map((r) => (
                <FilaRegistro key={r.estudianteId} r={r} mostrarCurso={mostrarCurso} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
