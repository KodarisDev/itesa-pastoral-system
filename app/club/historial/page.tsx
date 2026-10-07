import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AttendanceHistoryTable } from "@/components/club/AttendanceHistoryTable";
import { ExportAsistenciaModal } from "@/components/shared/ExportAsistenciaModal";
import { getClubById } from "@/lib/db/clubes";
import { esSoloEncargadoDeSubclub } from "@/lib/auth/permisos";
import { getSubclubById } from "@/lib/db/subclubes";
import { getSesionesEnriquecidas } from "@/lib/reportes/asistencia";

export const dynamic = "force-dynamic";

export default async function ClubHistorialPage() {
  const session = await auth();
  const idClub = session?.user.clubPrincipalId ?? session?.user.clubIds[0];
  if (!idClub) redirect("/login");

  // Un encargado de subclub ve solo la asistencia de su subclub.
  const soloSubclub = esSoloEncargadoDeSubclub(session!.user);
  const [club, sesiones, subclubes] = await Promise.all([
    getClubById(idClub),
    getSesionesEnriquecidas({ clubId: idClub, subclubIds: soloSubclub ? session!.user.subclubIds : undefined }),
    soloSubclub ? Promise.all(session!.user.subclubIds.map((id) => getSubclubById(id))) : Promise.resolve([]),
  ]);
  if (!club) redirect("/login");
  const titulo = soloSubclub ? subclubes.map((s) => s?.nombre).filter(Boolean).join(", ") : club.nombre;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Historial de asistencia</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {soloSubclub ? `${titulo} · ${club.nombre}` : club.nombre}
          </p>
        </div>
        <ExportAsistenciaModal scope="encargado" fechas={Array.from(new Set(sesiones.map((s) => s.fecha)))} />
      </div>
      <AttendanceHistoryTable sesiones={sesiones} />
    </div>
  );
}
