import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MembersList } from "@/components/club/MembersList";
import { getClubById } from "@/lib/db/clubes";
import { getEstudiantesByIds } from "@/lib/db/estudiantes";

export const dynamic = "force-dynamic";

export default async function ClubMiembrosPage() {
  const session = await auth();
  if (!session?.user.clubId) redirect("/login");

  const club = await getClubById(session.user.clubId);
  if (!club) redirect("/login");

  const miembros = await getEstudiantesByIds(club.miembrosActuales);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Miembros del club</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{club.nombre}</p>
      </div>
      <MembersList miembros={miembros} />
    </div>
  );
}
