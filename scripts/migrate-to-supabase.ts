import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");

const sb = createClient(url, key);
const DB_DIR = path.join(process.cwd(), "data", "db");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(DB_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

async function main() {
  const clubesJson = await readJson<any[]>("clubes.json");
  const estudiantesJson = await readJson<any[]>("estudiantes.json");
  const usuariosJson = await readJson<any[]>("usuarios.json");

  // --- roles: mapear nombre -> id_rol (ya sembrados en el paso anterior) ---
  const { data: roles, error: rolesErr } = await sb.from("roles").select("id_rol, nombre");
  if (rolesErr) throw rolesErr;
  const idRolPorNombre = new Map(roles.map((r) => [r.nombre, r.id_rol]));

  // --- clubes ---
  const clubesInsert = clubesJson.map((c) => ({
    nombre: c.nombre,
    descripcion: c.descripcion,
    capacidad: c.capacidadMaxima ?? null,
    foto: c.fotoUrl ?? null,
  }));
  const { data: clubesInsertados, error: clubesErr } = await sb.from("clubes").insert(clubesInsert).select();
  if (clubesErr) throw clubesErr;
  const idClubPorViejo = new Map<string, number>();
  clubesJson.forEach((c, i) => idClubPorViejo.set(c.id, clubesInsertados[i].id_club));
  console.log(`✓ ${clubesInsertados.length} clubes migrados`);

  // --- estudiantes (curso queda null: el dato viejo no coincide con el
  //     dominio real 4to/5to/6to, se llenará con la carga inicial real) ---
  const estudiantesInsert = estudiantesJson.map((e) => ({
    nombre: e.nombre,
    apellido: e.apellido,
    matricula: e.matricula,
    curso: null,
    activo: true,
  }));
  const { data: estudiantesInsertados, error: estErr } = await sb.from("estudiantes").insert(estudiantesInsert).select();
  if (estErr) throw estErr;
  const idEstudiantePorViejo = new Map<string, number>();
  estudiantesJson.forEach((e, i) => idEstudiantePorViejo.set(e.id, estudiantesInsertados[i].id_estudiante));
  console.log(`✓ ${estudiantesInsertados.length} estudiantes migrados (curso sin asignar)`);

  // --- asignar id_club a cada estudiante según clubes[].miembrosActuales ---
  for (const c of clubesJson) {
    const idClub = idClubPorViejo.get(c.id)!;
    const idsEstudiantes = (c.miembrosActuales as string[]).map((id: string) => idEstudiantePorViejo.get(id)).filter(Boolean);
    if (idsEstudiantes.length === 0) continue;
    const { error } = await sb.from("estudiantes").update({ id_club: idClub }).in("id_estudiante", idsEstudiantes as number[]);
    if (error) throw error;
  }
  console.log("✓ membresías de club asignadas");

  // --- usuarios (id_estudiante queda null: no había vínculo en los datos viejos) ---
  const idUsuarioPorViejo = new Map<string, number>();
  for (const u of usuariosJson) {
    const idRol = idRolPorNombre.get(u.rol);
    if (!idRol) throw new Error(`Rol desconocido: ${u.rol}`);
    const { data, error } = await sb
      .from("usuarios")
      .insert({
        id_rol: idRol,
        nombre: u.nombre,
        usuario: u.username,
        password_hash: u.passwordHash,
        activo: true,
      })
      .select()
      .single();
    if (error) throw error;
    idUsuarioPorViejo.set(u.id, data.id_usuario);
  }
  console.log(`✓ ${usuariosJson.length} usuarios migrados`);

  // --- encargados: club.encargadoUsuarioId -> fila en encargados (principal) ---
  const encargadosInsert = clubesJson
    .filter((c) => c.encargadoUsuarioId && idUsuarioPorViejo.has(c.encargadoUsuarioId))
    .map((c) => ({
      id_club: idClubPorViejo.get(c.id)!,
      id_usuario: idUsuarioPorViejo.get(c.encargadoUsuarioId)!,
      encargado_principal: true,
    }));
  if (encargadosInsert.length > 0) {
    const { error } = await sb.from("encargados").insert(encargadosInsert);
    if (error) throw error;
  }
  console.log(`✓ ${encargadosInsert.length} encargados asignados`);

  console.log("\nMigración completa.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
