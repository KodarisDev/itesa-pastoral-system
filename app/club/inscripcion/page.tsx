import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InscripcionManager } from "@/components/club/InscripcionManager";
import { getClubById } from "@/lib/db/clubes";
import { getSubclubesDeClub } from "@/lib/db/subclubes";
import { esSoloEncargadoDeSubclub } from "@/lib/auth/permisos";
import { getEstudiantesCached } from "@/lib/db/cached";

export const dynamic = "force-dynamic";

export default async function ClubInscripcionPage() {
  const session = await auth();
  const idClub = session?.user.clubPrincipalId ?? session?.user.clubIds[0];
  if (!session || !idClub) redirect("/login");

  const [club, estudiantes, subclubesDelClub] = await Promise.all([
    getClubById(idClub),
    getEstudiantesCached(),
    getSubclubesDeClub(idClub),
  ]);
  if (!club) redirect("/login");

  // Encargado de subclub: agrega gente a su(s) subclub(es); el encargado general inscribe en el club.
  const soloSubclub = esSoloEncargadoDeSubclub(session.user);
  const misSubclubes = soloSubclub ? subclubesDelClub.filter((s) => session.user.subclubIds.includes(s.id_subclub)) : undefined;
  if (soloSubclub && (!misSubclubes || misSubclubes.length === 0)) redirect("/club");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Inscripción</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {misSubclubes
            ? `Agrega a ${misSubclubes.map((s) => s.nombre).join(", ")} a miembros de ${club.nombre} que aún no tienen subclub.`
            : `Busca a un estudiante sin club por matrícula y agrégalo a ${club.nombre}.`}
        </p>
      </div>

      <InscripcionManager
        estudiantes={estudiantes}
        clubNombre={club.nombre}
        subclubes={misSubclubes}
        clubId={club.id_club}
      />
    </div>
  );
}
