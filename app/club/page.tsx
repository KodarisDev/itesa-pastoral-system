import { redirect } from "next/navigation";
import { ClipboardCheck, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { ClubHeaderCard } from "@/components/club/ClubHeaderCard";
import { StatCard } from "@/components/admin/StatCard";
import { getClubById, getEstudiantesEncargadosDeClub, getEncargadosDeClub } from "@/lib/db/clubes";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { getAsistenciaPorClubCached, getConfiguracionCached } from "@/lib/db/cached";

export const dynamic = "force-dynamic";

export default async function ClubHomePage() {
  const session = await auth();
  const idClub = session?.user.clubPrincipalId ?? session?.user.clubIds[0];
  if (!idClub) redirect("/login");

  const [club, miembros, filas, configuracion, estudiantesEncargadosIds, encargadosDelClub] = await Promise.all([
    getClubById(idClub),
    getEstudiantesPorClub(idClub),
    getAsistenciaPorClubCached(idClub),
    getConfiguracionCached(),
    getEstudiantesEncargadosDeClub(idClub),
    getEncargadosDeClub(idClub),
  ]);
  if (!club) redirect("/login");

  const fechaUltima = filas[0]?.fecha;
  const filasUltimaSesion = fechaUltima ? filas.filter((f) => f.fecha === fechaUltima) : [];
  const presentesUltimaSesion = filasUltimaSesion.filter((f) => f.estado === "Presente" || f.estado === "Tarde").length;
  const miembrosDeCapacidad = miembros.filter((m) => !estudiantesEncargadosIds.has(m.id_estudiante)).length;
  const esEncargadoPrincipal = encargadosDelClub.some(
    (e) => e.id_usuario === Number(session?.user.id) && e.encargado_principal,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Mi club</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bienvenido/a, {session?.user.name}.</p>
      </div>

      <ClubHeaderCard
        club={club}
        miembrosActuales={miembrosDeCapacidad}
        estudiantesEncargados={estudiantesEncargadosIds.size}
        configuracion={configuracion}
        puedeEditarFoto={esEncargadoPrincipal}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Miembros actuales" value={miembros.length} icon={Users} accent="neutral" />
        <StatCard
          label={fechaUltima ? `Última asistencia (${fechaUltima})` : "Sin asistencia registrada"}
          value={fechaUltima ? `${presentesUltimaSesion}/${filasUltimaSesion.length}` : "—"}
          icon={ClipboardCheck}
          accent="brand"
        />
      </div>
    </div>
  );
}
