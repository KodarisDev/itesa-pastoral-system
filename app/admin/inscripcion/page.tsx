import { InscripcionManager } from "@/components/admin/InscripcionManager";
import { getEstudiantes, getConteoMiembrosPorClub } from "@/lib/db/estudiantes";
import { getClubes } from "@/lib/db/clubes";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminInscripcionPage() {
  await requireVista("estudiantes:inscribir");

  const [estudiantes, clubes, miembrosPorClub] = await Promise.all([
    getEstudiantes(),
    getClubes(),
    getConteoMiembrosPorClub(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Inscripción</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Busca a un estudiante por matrícula y asígnalo directamente a un club.
        </p>
      </div>

      <InscripcionManager estudiantes={estudiantes} clubes={clubes} miembrosPorClub={miembrosPorClub} />
    </div>
  );
}
