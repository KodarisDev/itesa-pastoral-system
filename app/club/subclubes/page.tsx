import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SubclubesManager } from "@/components/shared/SubclubesManager";
import { getClubById } from "@/lib/db/clubes";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { getSubclubesDeClub, getEncargadosSubclub } from "@/lib/db/subclubes";
import { getUsuariosCached, getRolesCached } from "@/lib/db/cached";

export const dynamic = "force-dynamic";

export default async function ClubSubclubesPage() {
  const session = await auth();
  const principal = session?.user.clubPrincipalId;
  const idClub = principal && session?.user.clubGeneralIds.includes(principal) ? principal : session?.user.clubGeneralIds[0];
  // Solo el encargado general gestiona subclubes; los de subclub solo pasan lista.
  if (!session || !idClub) redirect("/club");

  const [club, miembros, subclubes, todosEncargados, usuarios, roles] = await Promise.all([
    getClubById(idClub),
    getEstudiantesPorClub(idClub),
    getSubclubesDeClub(idClub),
    getEncargadosSubclub(),
    getUsuariosCached(),
    getRolesCached(),
  ]);
  if (!club) redirect("/login");

  const idRolEncargado = roles.find((r) => r.nombre === "encargado_club")?.id_rol;
  const usuariosEncargados = usuarios
    .filter((u) => u.id_rol === idRolEncargado && u.activo)
    .map((u) => ({ id_usuario: u.id_usuario, nombre: u.nombre }));
  const idsSubclubes = new Set(subclubes.map((s) => s.id_subclub));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Subclubes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {club.nombre} — crea subclubes, asigna a sus encargados y a los miembros del club. Cada subclub pasa su propia lista y se
          refleja en la asistencia del club.
        </p>
      </div>
      <SubclubesManager
        clubId={club.id_club}
        subclubes={subclubes}
        miembros={miembros}
        encargadosSubclub={todosEncargados.filter((e) => idsSubclubes.has(e.id_subclub))}
        usuarios={usuariosEncargados}
      />
    </div>
  );
}
