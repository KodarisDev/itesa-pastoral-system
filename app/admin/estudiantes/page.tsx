import { RosterUploadDialog } from "@/components/admin/RosterUploadDialog";
import { StudentsManager } from "@/components/admin/StudentsManager";
import { getEstudiantes } from "@/lib/db/estudiantes";
import { getClubes } from "@/lib/db/clubes";
import { getHistorial } from "@/lib/db/historial";
import { getMeta } from "@/lib/db/meta";

export const dynamic = "force-dynamic";

export default async function AdminEstudiantesPage({ searchParams }: { searchParams: { matricula?: string } }) {
  const [estudiantes, clubes, historial, meta] = await Promise.all([
    getEstudiantes(),
    getClubes(),
    getHistorial(),
    getMeta(),
  ]);

  const clubPorEstudiante = new Map<string, string>();
  for (const club of clubes) {
    for (const id of club.miembrosActuales) clubPorEstudiante.set(id, club.nombre);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Estudiantes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Año escolar vigente: <span className="font-medium text-gray-800 dark:text-gray-200">{meta.anioActual}</span> ·{" "}
            {estudiantes.length} estudiante(s) en el listado.
          </p>
        </div>
        <RosterUploadDialog />
      </div>

      <StudentsManager
        estudiantes={estudiantes}
        clubPorEstudiante={clubPorEstudiante}
        historial={historial}
        initialMatricula={searchParams.matricula}
      />
    </div>
  );
}
