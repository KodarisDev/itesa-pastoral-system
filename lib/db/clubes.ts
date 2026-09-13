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

/** Cuenta miembros actuales de un club (estudiantes.id_club = idClub, activos). */
export async function contarMiembros(idClub: number): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("id_estudiante", { count: "exact", head: true })
    .eq("id_club", idClub)
    .eq("activo", true);
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
