import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AttendanceHistoryTable } from "@/components/club/AttendanceHistoryTable";
import { ExportAsistenciaModal } from "@/components/shared/ExportAsistenciaModal";
import { getClubById } from "@/lib/db/clubes";
import { getEstudiantesByIds } from "@/lib/db/estudiantes";
import { getAsistenciasByClub } from "@/lib/db/asistencias";
import { getOpcionesFiltro } from "@/lib/reportes/asistencia";

export const dynamic = "force-dynamic";

export default async function ClubHistorialPage() {
  const session = await auth();
  if (!session?.user.clubId) redirect("/login");

  const club = await getClubById(session.user.clubId);
  if (!club) redirect("/login");

  const [sesiones, miembros, opciones] = await Promise.all([
    getAsistenciasByClub(club.id),
    getEstudiantesByIds(club.miembrosActuales),
    getOpcionesFiltro(club.id),
  ]);
  const estudiantesMap = new Map(miembros.map((e) => [e.id, e]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Historial de asistencia</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{club.nombre}</p>
        </div>
        <ExportAsistenciaModal scope="encargado" ciclos={opciones.ciclos} anios={opciones.anios} />
      </div>
      <AttendanceHistoryTable sesiones={sesiones} estudiantesMap={estudiantesMap} />
    </div>
  );
}
