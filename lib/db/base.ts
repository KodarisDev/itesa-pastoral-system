import { promises as fs } from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data", "db");
const SEED_DIR = path.join(process.cwd(), "data", "seed");
const BACKUP_DIR = path.join(DB_DIR, "backups");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Lee un archivo JSON de data/db. Si no existe todavía, lo inicializa
 * copiando el archivo homónimo de data/seed (o el fallback si tampoco hay seed).
 */
export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  await ensureDir(DB_DIR);
  const dbPath = path.join(DB_DIR, filename);
  try {
    const raw = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const seedPath = path.join(SEED_DIR, filename);
    try {
      const raw = await fs.readFile(seedPath, "utf-8");
      const parsed = JSON.parse(raw) as T;
      await writeJson(filename, parsed);
      return parsed;
    } catch {
      await writeJson(filename, fallback);
      return fallback;
    }
  }
}

/** Escritura atómica: escribe a un archivo temporal y luego lo renombra. */
export async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDir(DB_DIR);
  const dbPath = path.join(DB_DIR, filename);
  const tmpPath = path.join(DB_DIR, `.${filename}.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmpPath, dbPath);
}

/** Copia el archivo actual a data/db/backups antes de una operación destructiva. */
export async function backupFile(filename: string): Promise<void> {
  await ensureDir(BACKUP_DIR);
  const dbPath = path.join(DB_DIR, filename);
  try {
    const raw = await fs.readFile(dbPath, "utf-8");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.writeFile(path.join(BACKUP_DIR, `${stamp}-${filename}`), raw, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

// Cola de promesas por archivo: serializa operaciones de lectura-modificación-escritura
// sobre el mismo archivo para evitar condiciones de carrera dentro de un mismo proceso Node.
// No usar readJson/writeJson/withFileLock anidados sobre el MISMO archivo dentro de un
// mismo withFileLock — causaría deadlock. Las funciones de lectura simple no necesitan lock
// (las escrituras son atómicas vía tmp+rename, así que una lectura nunca ve un archivo a medias).
const queues = new Map<string, Promise<unknown>>();

export function withFileLock<T>(filename: string, fn: () => Promise<T>): Promise<T> {
  const prev = queues.get(filename) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  queues.set(
    filename,
    run.catch(() => undefined),
  );
  return run;
}

export function absoluteDbPath(filename: string): string {
  return path.join(DB_DIR, filename);
}

export function absoluteSeedPath(filename: string): string {
  return path.join(SEED_DIR, filename);
}
