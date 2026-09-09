import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const SEED_DIR = path.join(process.cwd(), "data", "seed");
const DB_DIR = path.join(process.cwd(), "data", "db");

const ARCHIVOS_SIMPLES: Array<[seed: string, db: string]> = [
  ["estudiantes.seed.json", "estudiantes.json"],
  ["clubes.seed.json", "clubes.json"],
  ["solicitudes.seed.json", "solicitudes.json"],
  ["asistencias.seed.json", "asistencias.json"],
  ["historial.seed.json", "historial.json"],
  ["meta.seed.json", "meta.json"],
];

interface UsuarioSeedRow {
  id: string;
  nombre: string;
  username: string;
  passwordPlano: string;
  rol: string;
  tipoPersona?: string;
  clubId?: string;
}

async function main() {
  await fs.mkdir(DB_DIR, { recursive: true });

  for (const [seedFile, dbFile] of ARCHIVOS_SIMPLES) {
    const raw = await fs.readFile(path.join(SEED_DIR, seedFile), "utf-8");
    await fs.writeFile(path.join(DB_DIR, dbFile), raw, "utf-8");
    console.log(`  ✓ ${dbFile}`);
  }

  const usuariosSeedRaw = await fs.readFile(path.join(SEED_DIR, "usuarios.seed.json"), "utf-8");
  const usuariosSeed = JSON.parse(usuariosSeedRaw) as UsuarioSeedRow[];
  const usuarios = usuariosSeed.map(({ passwordPlano, ...resto }) => ({
    ...resto,
    passwordHash: bcrypt.hashSync(passwordPlano, 10),
  }));
  await fs.writeFile(
    path.join(DB_DIR, "usuarios.json"),
    JSON.stringify(usuarios, null, 2),
    "utf-8",
  );
  console.log("  ✓ usuarios.json (contraseñas hasheadas con bcrypt)");

  console.log("\nDatos de ejemplo cargados en data/db/. Credenciales de prueba:\n");
  for (const u of usuariosSeed) {
    const detalle = u.clubId ? `, club: ${u.clubId}` : "";
    console.log(`  ${u.username} / ${u.passwordPlano}  (${u.rol}${detalle})`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
