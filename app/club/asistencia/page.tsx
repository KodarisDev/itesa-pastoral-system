import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AttendanceSheet } from "@/components/club/AttendanceSheet";
import { getClubById } from "@/lib/db/clubes";
import { getEstudiantesByIds } from "@/lib/db/estudiantes";
import { getAsistencia } from "@/lib/db/asistencias";

export const dynamic = "force-dynamic";

export default async function ClubAsistenciaPage({ searchParams }: { searchParams: { fecha?: string } }) {
  const session = await auth();
  if (!session?.user.clubId) redirect("/login");

  const club = await getClubById(session.user.clubId);
  if (!club) redirect("/login");

  const fecha = searchParams.fecha ?? new Date().toISOString().slice(0, 10);
  const [miembros, sesionExistente] = await Promise.all([
    getEstudiantesByIds(club.miembrosActuales),
    getAsistencia(club.id, fecha),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Pasar lista</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{club.nombre} — marca quién asistió y guarda la asistencia.</p>
      </div>
      <AttendanceSheet
        key={fecha}
        clubId={club.id}
        fecha={fecha}
        miembros={miembros}
        registrosIniciales={sesionExistente?.registros ?? []}
      />
    </div>
  );
}
