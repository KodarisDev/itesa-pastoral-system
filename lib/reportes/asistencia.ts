import { getAsistenciaPorEstudiante } from "@/lib/db/asistencia";
import { getClubesCached, getEstudiantesCached, getUsuariosCached, getAsistenciaTodasCached, getAsistenciaPorClubCached, getSubclubesCached } from "@/lib/db/cached";
import type { RegistroAsistencia } from "@/lib/db/asistencia";

export interface FiltroAsistencia {
  clubId?: number;
  /** Si se indica, solo asistencia de esos subclubes (vista de un encargado de subclub). */
  subclubIds?: number[];
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface RegistroEnriquecido {
  estudianteId: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  curso: string;
  matricula: string;
  presente: boolean;
  justificacion?: string;
  /** Subclub del estudiante al pasar lista (null = lista general / sin subclub). */
  subclubId: number | null;
  subclubNombre: string | null;
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
  subclubesMap: Map<number, { nombre: string }>,
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
        nombre: est?.nombre ?? `#${f.id_estudiante}`,
        apellido: est?.apellido ?? "",
        nombreCompleto: est ? `${est.nombre} ${est.apellido}` : `#${f.id_estudiante}`,
        curso: est?.curso ?? "—",
        matricula: est?.matricula ?? "—",
        presente: f.estado === "Presente" || f.estado === "Tarde",
        justificacion: f.nota ?? undefined,
        subclubId: f.id_subclub ?? null,
        subclubNombre: f.id_subclub != null ? (subclubesMap.get(f.id_subclub)?.nombre ?? null) : null,
      };
    });
    sesiones.push({
      sesionId: clave,
      clubId: idClub,
      clubNombre: clubesMap.get(idClub)?.nombre ?? "Club eliminado",
      fecha,
      // Varios encargados pueden haber pasado lista el mismo día (general + subclubes).
      tomadaPorNombre:
        Array.from(new Set(filasGrupo.map((f) => usuariosMap.get(f.id_usuario)?.nombre ?? "—"))).join(", "),
      registros,
      presentes: registros.filter((r) => r.presente).length,
      total: registros.length,
    });
  }

  return sesiones.sort((a, b) => b.fecha.localeCompare(a.fecha) || a.clubNombre.localeCompare(b.clubNombre));
}

export async function getSesionesEnriquecidas(filtro: FiltroAsistencia = {}): Promise<SesionEnriquecida[]> {
  const [filas, clubes, estudiantes, usuarios, subclubes] = await Promise.all([
    filtro.clubId ? getAsistenciaPorClubCached(filtro.clubId) : getAsistenciaTodasCached(),
    getClubesCached(),
    getEstudiantesCached(),
    getUsuariosCached(),
    getSubclubesCached(),
  ]);

  const clubesMap = new Map(clubes.map((c) => [c.id_club, c]));
  const estudiantesMap = new Map(estudiantes.map((e) => [e.id_estudiante, e]));
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));
  const subclubesMap = new Map(subclubes.map((s) => [s.id_subclub, s]));

  let filtradas = filas;
  if (filtro.subclubIds) {
    const permitidos = new Set(filtro.subclubIds);
    filtradas = filtradas.filter((f) => f.id_subclub != null && permitidos.has(f.id_subclub));
  }
  if (filtro.fechaDesde) filtradas = filtradas.filter((f) => f.fecha >= filtro.fechaDesde!);
  if (filtro.fechaHasta) filtradas = filtradas.filter((f) => f.fecha <= filtro.fechaHasta!);

  return agruparEnSesiones(filtradas, clubesMap, estudiantesMap, usuariosMap, subclubesMap);
}

export async function getSesionesDeEstudiante(idEstudiante: number): Promise<SesionEnriquecida[]> {
  const [filas, clubes, estudiantes, usuarios, subclubes] = await Promise.all([
    getAsistenciaPorEstudiante(idEstudiante),
    getClubesCached(),
    getEstudiantesCached(),
    getUsuariosCached(),
    getSubclubesCached(),
  ]);
  const clubesMap = new Map(clubes.map((c) => [c.id_club, c]));
  const estudiantesMap = new Map(estudiantes.map((e) => [e.id_estudiante, e]));
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));
  const subclubesMap = new Map(subclubes.map((s) => [s.id_subclub, s]));
  return agruparEnSesiones(filas, clubesMap, estudiantesMap, usuariosMap, subclubesMap);
}

export interface OpcionesFiltroAsistencia {
  clubes: { id: number; nombre: string }[];
}

export async function getOpcionesFiltro(soloClubId?: number): Promise<OpcionesFiltroAsistencia> {
  const clubes = await getClubesCached();
  const clubesVisibles = soloClubId ? clubes.filter((c) => c.id_club === soloClubId) : clubes;
  return { clubes: clubesVisibles.map((c) => ({ id: c.id_club, nombre: c.nombre })) };
}
