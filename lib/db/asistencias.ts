import { readJson, writeJson, withFileLock } from "./base";
import type { SesionAsistencia } from "@/types";

const FILE = "asistencias.json";

export const getAsistencias = () => readJson<SesionAsistencia[]>(FILE, []);

export async function getAsistenciasByClub(clubId: string) {
  const list = await getAsistencias();
  return list
    .filter((a) => a.clubId === clubId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function getAsistencia(clubId: string, fecha: string) {
  const list = await getAsistencias();
  return list.find((a) => a.clubId === clubId && a.fecha === fecha) ?? null;
}

/** Upsert por (clubId, fecha) — pasar lista dos veces el mismo día actualiza el registro. */
export function saveAsistencia(sesion: SesionAsistencia) {
  return withFileLock(FILE, async () => {
    const list = await readJson<SesionAsistencia[]>(FILE, []);
    const idx = list.findIndex(
      (a) => a.clubId === sesion.clubId && a.fecha === sesion.fecha,
    );
    if (idx >= 0) list[idx] = sesion;
    else list.push(sesion);
    await writeJson(FILE, list);
    return sesion;
  });
}
