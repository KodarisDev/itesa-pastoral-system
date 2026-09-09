import { promises as fs } from "fs";
import bcrypt from "bcryptjs";
import { writeJson, withFileLock, absoluteDbPath, absoluteSeedPath } from "./base";
import type { Usuario } from "@/types";

const FILE = "usuarios.json";

interface UsuarioSeed extends Omit<Usuario, "passwordHash"> {
  passwordPlano: string;
}

/**
 * Lectura sin lock: si data/db/usuarios.json no existe todavía, lo inicializa
 * hasheando las contraseñas en texto plano del seed (data/seed/usuarios.seed.json)
 * con bcryptjs, y escribe el resultado ya hasheado. El seed nunca guarda hashes.
 */
async function readUsuariosRaw(): Promise<Usuario[]> {
  try {
    const raw = await fs.readFile(absoluteDbPath(FILE), "utf-8");
    return JSON.parse(raw) as Usuario[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const seedRaw = await fs.readFile(absoluteSeedPath("usuarios.seed.json"), "utf-8");
    const seed = JSON.parse(seedRaw) as UsuarioSeed[];
    const usuarios: Usuario[] = seed.map(({ passwordPlano, ...resto }) => ({
      ...resto,
      passwordHash: bcrypt.hashSync(passwordPlano, 10),
    }));
    await writeJson(FILE, usuarios);
    return usuarios;
  }
}

export const getUsuarios = () => readUsuariosRaw();

export async function getUsuarioByUsername(username: string) {
  const list = await readUsuariosRaw();
  return (
    list.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null
  );
}

export async function getUsuarioById(id: string) {
  const list = await readUsuariosRaw();
  return list.find((u) => u.id === id) ?? null;
}

export function saveUsuario(usuario: Usuario) {
  return withFileLock(FILE, async () => {
    const list = await readUsuariosRaw();
    const idx = list.findIndex((u) => u.id === usuario.id);
    if (idx >= 0) list[idx] = usuario;
    else list.push(usuario);
    await writeJson(FILE, list);
    return usuario;
  });
}

export function deleteUsuario(id: string) {
  return withFileLock(FILE, async () => {
    const list = await readUsuariosRaw();
    await writeJson(
      FILE,
      list.filter((u) => u.id !== id),
    );
  });
}

export function hashPassword(plain: string) {
  return bcrypt.hashSync(plain, 10);
}
