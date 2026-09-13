import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AttendanceHistoryTable } from "@/components/club/AttendanceHistoryTable";
import { ExportAsistenciaModal } from "@/components/shared/ExportAsistenciaModal";
import { getClubById } from "@/lib/db/clubes";
import { getSesionesEnriquecidas } from "@/lib/reportes/asistencia";

export const dynamic = "force-dynamic";

export default async function ClubHistorialPage() {
  const session = await auth();
  const idClub = session?.user.clubPrincipalId ?? session?.user.clubIds[0];
  if (!idClub) redirect("/login");

  const [club, sesiones] = await Promise.all([getClubById(idClub), getSesionesEnriquecidas({ clubId: idClub })]);
  if (!club) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Historial de asistencia</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{club.nombre}</p>
        </div>
        <ExportAsistenciaModal scope="encargado" />
      </div>
      <AttendanceHistoryTable sesiones={sesiones} />
    </div>
  );
}
