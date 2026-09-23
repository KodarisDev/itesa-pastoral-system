import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Club, Encargado } from "@/types";

export async function getClubes(): Promise<Club[]> {
  const { data, error } = await getSupabaseAdmin().from("clubes").select("*").order("nombre");
  if (error) throw new Error(error.message);
  return data;
}

export async function getClubById(idClub: number): Promise<Club | null> {
  const { data, error } = await getSupabaseAdmin().from("clubes").select("*").eq("id_club", idClub).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function crearClub(club: Omit<Club, "id_club">): Promise<Club> {
  const { data, error } = await getSupabaseAdmin().from("clubes").insert(club).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarClub(idClub: number, cambios: Partial<Omit<Club, "id_club">>): Promise<Club> {
  const { data, error } = await getSupabaseAdmin().from("clubes").update(cambios).eq("id_club", idClub).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function eliminarClub(idClub: number): Promise<void> {
  const { error } = await getSupabaseAdmin().from("clubes").delete().eq("id_club", idClub);
  if (error) throw new Error(error.message);
}

/**
 * Mapa id_club -> ids de estudiantes que son encargados de ese club. Un
 * estudiante-encargado aparece inscrito en su club pero no debe contar contra
 * su capacidad máxima (solo se exime en el club que dirige, no en otros).
 */
export async function getMapaEstudiantesEncargadosPorClub(): Promise<Map<number, Set<number>>> {
  const admin = getSupabaseAdmin();
  const { data: encargados, error: errEncargados } = await admin.from("encargados").select("id_club, id_usuario");
  if (errEncargados) throw new Error(errEncargados.message);
  if (!encargados || encargados.length === 0) return new Map();

  const idsUsuario = [...new Set(encargados.map((e) => e.id_usuario))];
  const { data: usuarios, error: errUsuarios } = await admin
    .from("usuarios")
    .select("id_usuario, id_estudiante")
    .in("id_usuario", idsUsuario)
    .not("id_estudiante", "is", null);
  if (errUsuarios) throw new Error(errUsuarios.message);

  const estudiantePorUsuario = new Map<number, number>(usuarios.map((u) => [u.id_usuario, u.id_estudiante as number]));
  const mapa = new Map<number, Set<number>>();
  for (const e of encargados) {
    const idEstudiante = estudiantePorUsuario.get(e.id_usuario);
    if (idEstudiante == null) continue;
    if (!mapa.has(e.id_club)) mapa.set(e.id_club, new Set());
    mapa.get(e.id_club)!.add(idEstudiante);
  }
  return mapa;
}

/** Ids de estudiantes que son encargados de idClub (no cuentan contra su cupo). */
export async function getEstudiantesEncargadosDeClub(idClub: number): Promise<Set<number>> {
  const encargados = await getEncargadosDeClub(idClub);
  if (encargados.length === 0) return new Set();
  const { data, error } = await getSupabaseAdmin()
    .from("usuarios")
    .select("id_estudiante")
    .in("id_usuario", encargados.map((e) => e.id_usuario))
    .not("id_estudiante", "is", null);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((u) => u.id_estudiante as number));
}

/** Cantidad de encargados-estudiantes por club, para mostrar aparte del cupo. */
export async function getConteoEncargadosEstudiantesPorClub(): Promise<Map<number, number>> {
  const mapa = await getMapaEstudiantesEncargadosPorClub();
  const out = new Map<number, number>();
  for (const [idClub, set] of mapa) out.set(idClub, set.size);
  return out;
}

/**
 * Cuenta miembros actuales de un club (estudiantes.id_club = idClub, activos)
 * SIN contar a los estudiantes que son encargados de ese mismo club — quedan
 * inscritos pero no ocupan cupo.
 */
export async function contarMiembros(idClub: number): Promise<number> {
  const exentos = await getEstudiantesEncargadosDeClub(idClub);
  let query = getSupabaseAdmin()
    .from("estudiantes")
    .select("id_estudiante", { count: "exact", head: true })
    .eq("id_club", idClub)
    .eq("activo", true);
  if (exentos.size > 0) {
    query = query.not("id_estudiante", "in", `(${[...exentos].join(",")})`);
  }
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ---------------------------------------------------------
// Encargados (relación N:M club <-> usuario)
// ---------------------------------------------------------

export async function getEncargados(): Promise<Encargado[]> {
  const { data, error } = await getSupabaseAdmin().from("encargados").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function getEncargadosDeClub(idClub: number): Promise<Encargado[]> {
  const { data, error } = await getSupabaseAdmin().from("encargados").select("*").eq("id_club", idClub);
  if (error) throw new Error(error.message);
  return data;
}

export async function getClubesDeUsuario(idUsuario: number): Promise<Encargado[]> {
  const { data, error } = await getSupabaseAdmin().from("encargados").select("*").eq("id_usuario", idUsuario);
  if (error) throw new Error(error.message);
  return data;
}

export async function agregarEncargado(
  idClub: number,
  idUsuario: number,
  principal: boolean,
): Promise<Encargado> {
  const admin = getSupabaseAdmin();
  if (principal) {
    // Solo puede haber un principal por club (índice único parcial en la BD
    // ya lo garantiza, pero lo bajamos explícitamente aquí primero).
    const { error: clearError } = await admin
      .from("encargados")
      .update({ encargado_principal: false })
      .eq("id_club", idClub)
      .eq("encargado_principal", true);
    if (clearError) throw new Error(clearError.message);
  }
  const { data, error } = await admin
    .from("encargados")
    .insert({ id_club: idClub, id_usuario: idUsuario, encargado_principal: principal })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function quitarEncargado(idClub: number, idUsuario: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("encargados")
    .delete()
    .eq("id_club", idClub)
    .eq("id_usuario", idUsuario);
  if (error) throw new Error(error.message);
}
