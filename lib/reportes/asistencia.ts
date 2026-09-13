import { getAsistenciaTodas, getAsistenciaPorClub, getAsistenciaPorEstudiante } from "@/lib/db/asistencia";
import { getClubes } from "@/lib/db/clubes";
import { getEstudiantes } from "@/lib/db/estudiantes";
import { getUsuarios } from "@/lib/db/usuarios";
import type { RegistroAsistencia } from "@/lib/db/asistencia";

export interface FiltroAsistencia {
  clubId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface RegistroEnriquecido {
  estudianteId: number;
  nombreCompleto: string;
  curso: string;
  matricula: string;
  presente: boolean;
  justificacion?: string;
}

export interface SesionEnriquecida {
  sesionId: string;
  clubId: number;
  clubNombre: string;
  fecha: string;
  tomadaPorNombre: string;
  registros: RegistroEnriquecido[];
  presentes: number;
  total: number;
}

/** Agrupa filas individuales de asistencia (una por estudiante por día) en "sesiones" por (club, fecha). */
function agruparEnSesiones(
  filas: RegistroAsistencia[],
  clubesMap: Map<number, { nombre: string }>,
  estudiantesMap: Map<number, { nombre: string; apellido: string; curso: string | null; matricula: string }>,
  usuariosMap: Map<number, { nombre: string }>,
): SesionEnriquecida[] {
  const porGrupo = new Map<string, RegistroAsistencia[]>();
  for (const fila of filas) {
    const clave = `${fila.id_club}__${fila.fecha}`;
    const arr = porGrupo.get(clave) ?? [];
    arr.push(fila);
    porGrupo.set(clave, arr);
  }

  const sesiones: SesionEnriquecida[] = [];
  for (const [clave, filasGrupo] of porGrupo) {
    const [idClubStr, fecha] = clave.split("__");
    const idClub = Number(idClubStr);
    const registros: RegistroEnriquecido[] = filasGrupo.map((f) => {
      const est = estudiantesMap.get(f.id_estudiante);
      return {
        estudianteId: f.id_estudiante,
        nombreCompleto: est ? `${est.nombre} ${est.apellido}` : `#${f.id_estudiante}`,
        curso: est?.curso ?? "—",
        matricula: est?.matricula ?? "—",
        presente: f.estado === "Presente" || f.estado === "Tarde",
        justificacion: f.nota ?? undefined,
      };
    });
    sesiones.push({
      sesionId: clave,
      clubId: idClub,
      clubNombre: clubesMap.get(idClub)?.nombre ?? "Club eliminado",
      fecha,
      tomadaPorNombre: usuariosMap.get(filasGrupo[0].id_usuario)?.nombre ?? "—",
      registros,
      presentes: registros.filter((r) => r.presente).length,
      total: registros.length,
    });
  }

  return sesiones.sort((a, b) => b.fecha.localeCompare(a.fecha) || a.clubNombre.localeCompare(b.clubNombre));
}

export async function getSesionesEnriquecidas(filtro: FiltroAsistencia = {}): Promise<SesionEnriquecida[]> {
  const [filas, clubes, estudiantes, usuarios] = await Promise.all([
    filtro.clubId ? getAsistenciaPorClub(filtro.clubId) : getAsistenciaTodas(),
    getClubes(),
    getEstudiantes(),
    getUsuarios(),
  ]);

  const clubesMap = new Map(clubes.map((c) => [c.id_club, c]));
  const estudiantesMap = new Map(estudiantes.map((e) => [e.id_estudiante, e]));
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  let filtradas = filas;
  if (filtro.fechaDesde) filtradas = filtradas.filter((f) => f.fecha >= filtro.fechaDesde!);
  if (filtro.fechaHasta) filtradas = filtradas.filter((f) => f.fecha <= filtro.fechaHasta!);

  return agruparEnSesiones(filtradas, clubesMap, estudiantesMap, usuariosMap);
}

export async function getSesionesDeEstudiante(idEstudiante: number): Promise<SesionEnriquecida[]> {
  const [filas, clubes, estudiantes, usuarios] = await Promise.all([
    getAsistenciaPorEstudiante(idEstudiante),
    getClubes(),
    getEstudiantes(),
    getUsuarios(),
  ]);
  const clubesMap = new Map(clubes.map((c) => [c.id_club, c]));
  const estudiantesMap = new Map(estudiantes.map((e) => [e.id_estudiante, e]));
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));
  return agruparEnSesiones(filas, clubesMap, estudiantesMap, usuariosMap);
}

export interface OpcionesFiltroAsistencia {
  clubes: { id: number; nombre: string }[];
}

export async function getOpcionesFiltro(soloClubId?: number): Promise<OpcionesFiltroAsistencia> {
  const clubes = await getClubes();
  const clubesVisibles = soloClubId ? clubes.filter((c) => c.id_club === soloClubId) : clubes;
  return { clubes: clubesVisibles.map((c) => ({ id: c.id_club, nombre: c.nombre })) };
}
