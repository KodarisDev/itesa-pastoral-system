import { readJson, writeJson, withFileLock } from "./base";
import type { HistorialClub } from "@/types";

const FILE = "historial.json";

export const getHistorial = () => readJson<HistorialClub[]>(FILE, []);

export async function getHistorialByEstudiante(estudianteId: string) {
  const list = await getHistorial();
  return list
    .filter((h) => h.estudianteId === estudianteId)
    .sort((a, b) => b.fechaFin.localeCompare(a.fechaFin));
}

/** Agrega entradas nuevas al historial (append-only). */
export function appendHistorial(entradas: HistorialClub[]) {
  if (entradas.length === 0) return Promise.resolve();
  return withFileLock(FILE, async () => {
    const list = await readJson<HistorialClub[]>(FILE, []);
    await writeJson(FILE, [...list, ...entradas]);
  });
}
