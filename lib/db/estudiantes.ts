import { readJson, writeJson, withFileLock, backupFile } from "./base";
import type { Estudiante } from "@/types";

const FILE = "estudiantes.json";

export const getEstudiantes = () => readJson<Estudiante[]>(FILE, []);

export async function getEstudianteById(id: string) {
  const list = await getEstudiantes();
  return list.find((e) => e.id === id) ?? null;
}

export async function getEstudiantesByIds(ids: string[]) {
  const list = await getEstudiantes();
  const set = new Set(ids);
  return list.filter((e) => set.has(e.id));
}

/** Reemplaza el roster completo (carga de Excel = nuevo año escolar). Hace backup antes. */
export function replaceEstudiantes(estudiantes: Estudiante[]) {
  return withFileLock(FILE, async () => {
    await backupFile(FILE);
    await writeJson(FILE, estudiantes);
    return estudiantes;
  });
}
