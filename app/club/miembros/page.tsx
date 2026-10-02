import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MembersList } from "@/components/club/MembersList";
import { getClubById, getEstudiantesEncargadosDeClub } from "@/lib/db/clubes";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { getSubclubesDeClub } from "@/lib/db/subclubes";

export const dynamic = "force-dynamic";

export default async function ClubMiembrosPage() {
  const session = await auth();
  const idClub = session?.user.clubPrincipalId ?? session?.user.clubIds[0];
  if (!idClub) redirect("/login");

  const [club, miembros, estudiantesEncargadosIds, subclubes] = await Promise.all([
    getClubById(idClub),
    getEstudiantesPorClub(idClub),
    getEstudiantesEncargadosDeClub(idClub),
    getSubclubesDeClub(idClub),
  ]);
  if (!club) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Miembros del club</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{club.nombre}</p>
      </div>
      <MembersList
        miembros={miembros}
        estudiantesEncargadosIds={estudiantesEncargadosIds}
        nombreSubclub={Object.fromEntries(subclubes.map((s) => [s.id_subclub, s.nombre]))}
      />
    </div>
  );
}
