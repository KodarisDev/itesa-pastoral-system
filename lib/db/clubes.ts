import { readJson, writeJson, withFileLock, backupFile } from "./base";
import type { Club } from "@/types";

const FILE = "clubes.json";

export const getClubes = () => readJson<Club[]>(FILE, []);

export async function getClubById(id: string) {
  const list = await getClubes();
  return list.find((c) => c.id === id) ?? null;
}

export function saveClub(club: Club) {
  return withFileLock(FILE, async () => {
    const list = await readJson<Club[]>(FILE, []);
    const idx = list.findIndex((c) => c.id === club.id);
    if (idx >= 0) list[idx] = club;
    else list.push(club);
    await writeJson(FILE, list);
    return club;
  });
}

export function deleteClub(id: string) {
  return withFileLock(FILE, async () => {
    const list = await readJson<Club[]>(FILE, []);
    await writeJson(
      FILE,
      list.filter((c) => c.id !== id),
    );
  });
}

/** Reemplaza la lista completa de clubes (usado por operaciones masivas: nuevo año escolar). */
export function saveClubes(clubes: Club[]) {
  return withFileLock(FILE, async () => {
    await writeJson(FILE, clubes);
    return clubes;
  });
}

export const backupClubes = () => backupFile(FILE);
