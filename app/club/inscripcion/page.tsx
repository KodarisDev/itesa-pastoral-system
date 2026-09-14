import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InscripcionManager } from "@/components/club/InscripcionManager";
import { getClubById } from "@/lib/db/clubes";
import { getEstudiantesCached } from "@/lib/db/cached";

export const dynamic = "force-dynamic";

export default async function ClubInscripcionPage() {
  const session = await auth();
  const idClub = session?.user.clubPrincipalId ?? session?.user.clubIds[0];
  if (!idClub) redirect("/login");

  const [club, estudiantes] = await Promise.all([getClubById(idClub), getEstudiantesCached()]);
  if (!club) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Inscripción</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Busca a un estudiante sin club por matrícula y agrégalo a {club.nombre}.
        </p>
      </div>

      <InscripcionManager estudiantes={estudiantes} clubNombre={club.nombre} />
    </div>
  );
}
