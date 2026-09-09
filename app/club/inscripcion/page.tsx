import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InscripcionManager } from "@/components/club/InscripcionManager";
import { getClubById, getClubes } from "@/lib/db/clubes";
import { getEstudiantes } from "@/lib/db/estudiantes";

export const dynamic = "force-dynamic";

export default async function ClubInscripcionPage() {
  const session = await auth();
  if (!session?.user.clubId) redirect("/login");

  const club = await getClubById(session.user.clubId);
  if (!club) redirect("/login");

  const [estudiantes, clubes] = await Promise.all([getEstudiantes(), getClubes()]);

  const clubPorEstudiante = new Map<string, string>();
  for (const c of clubes) {
    for (const id of c.miembrosActuales) clubPorEstudiante.set(id, c.nombre);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Inscripción</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Busca a un estudiante sin club por matrícula y agrégalo a {club.nombre}.
        </p>
      </div>

      <InscripcionManager estudiantes={estudiantes} clubPorEstudiante={clubPorEstudiante} clubNombre={club.nombre} />
    </div>
  );
}
