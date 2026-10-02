import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AttendanceSheet } from "@/components/club/AttendanceSheet";
import { getClubById } from "@/lib/db/clubes";
import { getSubclubesDeClub } from "@/lib/db/subclubes";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { getAsistenciaDia } from "@/lib/db/asistencia";
import { getConfiguracion } from "@/lib/db/configuracion";
import { calcularVentanaAsistencia } from "@/lib/asistencia-ventana";

export const dynamic = "force-dynamic";

export default async function ClubAsistenciaPage({ searchParams }: { searchParams: { fecha?: string; grupo?: string } }) {
  const session = await auth();
  const idClub = session?.user.clubPrincipalId ?? session?.user.clubIds[0];
  if (!session || !idClub) redirect("/login");

  const fecha = searchParams.fecha ?? new Date().toISOString().slice(0, 10);
  const [club, todosLosMiembros, registrosDia, configuracion, subclubes] = await Promise.all([
    getClubById(idClub),
    getEstudiantesPorClub(idClub),
    getAsistenciaDia(idClub, fecha),
    getConfiguracion(),
    getSubclubesDeClub(idClub),
  ]);
  if (!club) redirect("/login");

  // Encargado general: lista de todo el club o de cualquier subclub. Encargado
  // de subclub: solo los subclubes que dirige (el club completo lo ve en Historial).
  const esGeneral = session.user.clubGeneralIds.includes(idClub);
  const grupos = esGeneral
    ? [
        { value: "club", label: subclubes.length > 0 ? "Todo el club" : club.nombre },
        ...subclubes.map((s) => ({ value: String(s.id_subclub), label: s.nombre })),
      ]
    : subclubes
        .filter((s) => session.user.subclubIds.includes(s.id_subclub))
        .map((s) => ({ value: String(s.id_subclub), label: s.nombre }));

  if (grupos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        No tienes ningún subclub asignado para pasar lista.
      </div>
    );
  }

  const grupo = grupos.some((g) => g.value === searchParams.grupo) ? (searchParams.grupo as string) : grupos[0].value;
  const subclubId = grupo === "club" ? null : Number(grupo);
  const miembros = subclubId === null ? todosLosMiembros : todosLosMiembros.filter((m) => m.id_subclub === subclubId);
  const idsMiembros = new Set(miembros.map((m) => m.id_estudiante));
  const registrosGrupo = registrosDia.filter((r) => idsMiembros.has(r.id_estudiante));
  const nombreSubclub = Object.fromEntries(subclubes.map((s) => [s.id_subclub, s.nombre]));

  const ventana = calcularVentanaAsistencia(configuracion);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Pasar lista</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{club.nombre} — marca quién asistió y guarda la asistencia.</p>
      </div>
      <AttendanceSheet
        key={`${fecha}-${grupo}`}
        clubId={club.id_club}
        subclubId={subclubId}
        grupos={grupos}
        grupo={grupo}
        nombreSubclub={nombreSubclub}
        fecha={fecha}
        miembros={miembros}
        registrosIniciales={registrosGrupo}
        ventana={ventana}
      />
    </div>
  );
}
