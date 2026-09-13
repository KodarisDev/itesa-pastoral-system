import { RosterUploadDialog } from "@/components/admin/RosterUploadDialog";
import { StudentsManager } from "@/components/admin/StudentsManager";
import { getEstudiantes } from "@/lib/db/estudiantes";
import { getClubes } from "@/lib/db/clubes";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminEstudiantesPage({ searchParams }: { searchParams: { matricula?: string } }) {
  await requireVista("estudiantes:ver");

  const [estudiantes, clubes] = await Promise.all([getEstudiantes(), getClubes()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Estudiantes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{estudiantes.length} estudiante(s) en el listado.</p>
        </div>
        <RosterUploadDialog />
      </div>

      <StudentsManager estudiantes={estudiantes} clubes={clubes} initialMatricula={searchParams.matricula} />
    </div>
  );
}
