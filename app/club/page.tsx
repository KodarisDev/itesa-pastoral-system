import { redirect } from "next/navigation";
import { ClipboardCheck, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { ClubHeaderCard } from "@/components/club/ClubHeaderCard";
import { StatCard } from "@/components/admin/StatCard";
import { getClubById } from "@/lib/db/clubes";
import { getAsistenciasByClub } from "@/lib/db/asistencias";

export const dynamic = "force-dynamic";

export default async function ClubHomePage() {
  const session = await auth();
  if (!session?.user.clubId) redirect("/login");

  const club = await getClubById(session.user.clubId);
  if (!club) redirect("/login");

  const asistencias = await getAsistenciasByClub(club.id);
  const ultimaSesion = asistencias[0];
  const presentesUltimaSesion = ultimaSesion?.registros.filter((r) => r.presente).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Mi club</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bienvenido/a, {session.user.name}.</p>
      </div>

      <ClubHeaderCard club={club} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Miembros actuales" value={club.miembrosActuales.length} icon={Users} accent="neutral" />
        <StatCard
          label={ultimaSesion ? `Última asistencia (${ultimaSesion.fecha})` : "Sin asistencia registrada"}
          value={ultimaSesion ? `${presentesUltimaSesion}/${ultimaSesion.registros.length}` : "—"}
          icon={ClipboardCheck}
          accent="brand"
        />
      </div>
    </div>
  );
}
