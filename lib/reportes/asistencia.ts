import { getAsistencias } from "@/lib/db/asistencias";
import { getClubes } from "@/lib/db/clubes";
import { getEstudiantes } from "@/lib/db/estudiantes";
import { getUsuarios } from "@/lib/db/usuarios";
import { getHistorial } from "@/lib/db/historial";
import type { Club, HistorialClub } from "@/types";

export interface FiltroAsistencia {
  clubId?: string;
  anioEscolar?: string;
  cicloNumero?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface RegistroEnriquecido {
  estudianteId: string;
  nombreCompleto: string;
  curso: string;
  matricula: string;
  presente: boolean;
}

export interface SesionEnriquecida {
  sesionId: string;
  clubId: string;
  clubNombre: string;
  fecha: string;
  anioEscolar: string;
  cicloNumero: number | null;
  tomadaPorNombre: string;
  registros: RegistroEnriquecido[];
  presentes: number;
  total: number;
}

interface RangoCiclo {
  numero: number;
  fechaInicio: string;
  fechaFin: string | null;
}

/**
 * SesionAsistencia no guarda el número de ciclo directamente. Se reconstruye
 * comparando la fecha de la sesión contra los rangos de cada ciclo del club:
 * el historial guarda los ciclos ya cerrados (fechaInicio/fechaFin), y el
 * ciclo actual del club aporta el rango todavía abierto.
 */
function construirRangosPorClub(clubes: Club[], historial: HistorialClub[]): Map<string, RangoCiclo[]> {
  const mapa = new Map<string, RangoCiclo[]>();

  for (const h of historial) {
    const arr = mapa.get(h.clubId) ?? [];
    if (!arr.some((r) => r.numero === h.cicloNumero)) {
      arr.push({ numero: h.cicloNumero, fechaInicio: h.fechaInicio, fechaFin: h.fechaFin });
    }
    mapa.set(h.clubId, arr);
  }

  for (const c of clubes) {
    const arr = mapa.get(c.id) ?? [];
    if (!arr.some((r) => r.numero === c.cicloActual.numero)) {
      arr.push({ numero: c.cicloActual.numero, fechaInicio: c.cicloActual.fechaInicio, fechaFin: null });
    }
    mapa.set(c.id, arr);
  }

  for (const arr of mapa.values()) arr.sort((a, b) => a.numero - b.numero);
  return mapa;
}

function cicloDeFecha(rangos: RangoCiclo[] | undefined, fecha: string): number | null {
  if (!rangos) return null;
  for (const r of rangos) {
    if (fecha >= r.fechaInicio && (r.fechaFin === null || fecha < r.fechaFin)) return r.numero;
  }
  return null;
}

export async function getSesionesEnriquecidas(filtro: FiltroAsistencia = {}): Promise<SesionEnriquecida[]> {
  const [asistencias, clubes, estudiantes, usuarios, historial] = await Promise.all([
    getAsistencias(),
    getClubes(),
    getEstudiantes(),
    getUsuarios(),
    getHistorial(),
  ]);

  const clubesMap = new Map(clubes.map((c) => [c.id, c]));
  const estudiantesMap = new Map(estudiantes.map((e) => [e.id, e]));
  const usuariosMap = new Map(usuarios.map((u) => [u.id, u]));
  const rangosPorClub = construirRangosPorClub(clubes, historial);

  let sesiones = asistencias;
  if (filtro.clubId) sesiones = sesiones.filter((s) => s.clubId === filtro.clubId);
  if (filtro.anioEscolar) sesiones = sesiones.filter((s) => s.anioEscolar === filtro.anioEscolar);
  if (filtro.fechaDesde) sesiones = sesiones.filter((s) => s.fecha >= filtro.fechaDesde!);
  if (filtro.fechaHasta) sesiones = sesiones.filter((s) => s.fecha <= filtro.fechaHasta!);

  const enriquecidas: SesionEnriquecida[] = sesiones.map((s) => {
    const club = clubesMap.get(s.clubId);
    const registros = s.registros.map((r) => {
      const est = estudiantesMap.get(r.estudianteId);
      return {
        estudianteId: r.estudianteId,
        nombreCompleto: est ? `${est.nombre} ${est.apellido}` : r.estudianteId,
        curso: est?.curso ?? "—",
        matricula: est?.matricula ?? r.estudianteId,
        presente: r.presente,
      };
    });
    return {
      sesionId: s.id,
      clubId: s.clubId,
      clubNombre: club?.nombre ?? "Club eliminado",
      fecha: s.fecha,
      anioEscolar: s.anioEscolar,
      cicloNumero: cicloDeFecha(rangosPorClub.get(s.clubId), s.fecha),
      tomadaPorNombre: usuariosMap.get(s.tomadaPorUsuarioId)?.nombre ?? "—",
      registros,
      presentes: registros.filter((r) => r.presente).length,
      total: registros.length,
    };
  });

  const filtradas =
    filtro.cicloNumero != null ? enriquecidas.filter((s) => s.cicloNumero === filtro.cicloNumero) : enriquecidas;

  return filtradas.sort((a, b) => b.fecha.localeCompare(a.fecha) || a.clubNombre.localeCompare(b.clubNombre));
}

export interface OpcionesFiltroAsistencia {
  clubes: { id: string; nombre: string }[];
  anios: string[];
  ciclos: number[];
}

export async function getOpcionesFiltro(soloClubId?: string): Promise<OpcionesFiltroAsistencia> {
  const [clubes, asistencias] = await Promise.all([getClubes(), getAsistencias()]);
  const clubesVisibles = soloClubId ? clubes.filter((c) => c.id === soloClubId) : clubes;
  const anios = Array.from(new Set(asistencias.map((a) => a.anioEscolar))).sort().reverse();
  const maxCiclo = clubesVisibles.reduce((max, c) => Math.max(max, c.cicloActual.numero), 1);

  return {
    clubes: clubesVisibles.map((c) => ({ id: c.id, nombre: c.nombre })),
    anios,
    ciclos: Array.from({ length: maxCiclo }, (_, i) => i + 1),
  };
}
