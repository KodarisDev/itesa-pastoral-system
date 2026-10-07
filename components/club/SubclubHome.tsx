import { ClipboardCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/StatCard";
import { getClubById } from "@/lib/db/clubes";
import { getEstudiantesPorSubclub, getSubclubById, getEncargadosSubclub } from "@/lib/db/subclubes";
import { getAsistenciaPorClubCached, getConfiguracionCached, getUsuariosCached } from "@/lib/db/cached";
import { formatearHorarioPastoral } from "@/lib/utils";

/** Inicio del encargado de subclub: su subclub (no el club completo) con sus miembros y su última asistencia. */
export async function SubclubHome({ user }: { user: { name?: string | null; subclubIds: number[] } }) {
  const [subclubesRaw, encargados, usuarios, configuracion] = await Promise.all([
    Promise.all(user.subclubIds.map((id) => getSubclubById(id))),
    getEncargadosSubclub(),
    getUsuariosCached(),
    getConfiguracionCached(),
  ]);
  const subclubes = subclubesRaw.filter((s): s is NonNullable<typeof s> => s != null);
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u.nombre]));
  const horario = configuracion ? formatearHorarioPastoral(configuracion) : null;

  const tarjetas = await Promise.all(
    subclubes.map(async (sc) => {
      const [club, miembros, filasClub] = await Promise.all([
        getClubById(sc.id_club),
        getEstudiantesPorSubclub(sc.id_subclub),
        getAsistenciaPorClubCached(sc.id_club),
      ]);
      const filas = filasClub.filter((f) => f.id_subclub === sc.id_subclub);
      const fechaUltima = filas[0]?.fecha;
      const ultima = fechaUltima ? filas.filter((f) => f.fecha === fechaUltima) : [];
      const presentes = ultima.filter((f) => f.estado === "Presente" || f.estado === "Tarde").length;
      const companeros = encargados
        .filter((e) => e.id_subclub === sc.id_subclub)
        .map((e) => usuariosMap.get(e.id_usuario))
        .filter(Boolean);
      return { sc, club, miembros: miembros.length, fechaUltima, presentes, totalUltima: ultima.length, companeros };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Mi subclub</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bienvenido/a, {user.name}.</p>
      </div>

      {tarjetas.map(({ sc, club, miembros, fechaUltima, presentes, totalUltima, companeros }) => (
        <div key={sc.id_subclub} className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Subclub de {club?.nombre ?? "—"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{sc.nombre}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {miembros} miembro{miembros === 1 ? "" : "s"}
              </Badge>
              {companeros.map((n) => (
                <Badge key={n} variant="outline">
                  Encargado: {n}
                </Badge>
              ))}
              {horario && <Badge variant="outline">Hora de pastoral: {horario}</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Miembros actuales" value={miembros} icon={Users} accent="neutral" />
            <StatCard
              label={fechaUltima ? `Última asistencia (${fechaUltima})` : "Sin asistencia registrada"}
              value={fechaUltima ? `${presentes}/${totalUltima}` : "—"}
              icon={ClipboardCheck}
              accent="brand"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
