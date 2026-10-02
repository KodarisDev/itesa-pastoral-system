import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { EncargadoSubclub, Estudiante, Subclub } from "@/types";

export async function getSubclubes(): Promise<Subclub[]> {
  const { data, error } = await getSupabaseAdmin().from("subclubes").select("*").order("nombre");
  if (error) throw new Error(error.message);
  return data;
}

export async function getSubclubesDeClub(idClub: number): Promise<Subclub[]> {
  const { data, error } = await getSupabaseAdmin().from("subclubes").select("*").eq("id_club", idClub).order("nombre");
  if (error) throw new Error(error.message);
  return data;
}

export async function getSubclubById(idSubclub: number): Promise<Subclub | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("subclubes")
    .select("*")
    .eq("id_subclub", idSubclub)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function crearSubclub(idClub: number, nombre: string): Promise<Subclub> {
  const { data, error } = await getSupabaseAdmin().from("subclubes").insert({ id_club: idClub, nombre }).select().single();
  if (error) throw new Error(error.code === "23505" ? "Ya existe un subclub con ese nombre en este club." : error.message);
  return data;
}

export async function renombrarSubclub(idSubclub: number, nombre: string): Promise<Subclub> {
  const { data, error } = await getSupabaseAdmin()
    .from("subclubes")
    .update({ nombre })
    .eq("id_subclub", idSubclub)
    .select()
    .single();
  if (error) throw new Error(error.code === "23505" ? "Ya existe un subclub con ese nombre en este club." : error.message);
  return data;
}

/** Los estudiantes del subclub quedan sin subclub (FK on delete set null); siguen en el club. */
export async function eliminarSubclub(idSubclub: number): Promise<void> {
  const { error } = await getSupabaseAdmin().from("subclubes").delete().eq("id_subclub", idSubclub);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------
// Encargados de subclub (siempre secundarios)
// ---------------------------------------------------------

export async function getEncargadosSubclub(): Promise<EncargadoSubclub[]> {
  const { data, error } = await getSupabaseAdmin().from("encargados_subclub").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function getSubclubesDeUsuario(idUsuario: number): Promise<(EncargadoSubclub & { id_club: number })[]> {
  const admin = getSupabaseAdmin();
  const { data: encargos, error } = await admin.from("encargados_subclub").select("*").eq("id_usuario", idUsuario);
  if (error) throw new Error(error.message);
  if (encargos.length === 0) return [];
  const { data: subclubes, error: errSub } = await admin
    .from("subclubes")
    .select("id_subclub, id_club")
    .in("id_subclub", encargos.map((e) => e.id_subclub));
  if (errSub) throw new Error(errSub.message);
  const clubPorSubclub = new Map(subclubes.map((s) => [s.id_subclub, s.id_club]));
  return encargos
    .filter((e) => clubPorSubclub.has(e.id_subclub))
    .map((e) => ({ ...e, id_club: clubPorSubclub.get(e.id_subclub) as number }));
}

export async function agregarEncargadoSubclub(idSubclub: number, idUsuario: number): Promise<void> {
  const { error } = await getSupabaseAdmin().from("encargados_subclub").insert({ id_subclub: idSubclub, id_usuario: idUsuario });
  if (error) throw new Error(error.code === "23505" ? "Ese usuario ya es encargado del subclub." : error.message);
}

export async function quitarEncargadoSubclub(idSubclub: number, idUsuario: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("encargados_subclub")
    .delete()
    .eq("id_subclub", idSubclub)
    .eq("id_usuario", idUsuario);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------
// Miembros (estudiantes.id_subclub)
// ---------------------------------------------------------

export async function getEstudiantesPorSubclub(idSubclub: number): Promise<Estudiante[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("id_subclub", idSubclub)
    .eq("activo", true)
    .order("apellido");
  if (error) throw new Error(error.message);
  return data;
}

export async function asignarEstudianteASubclub(idEstudiante: number, idSubclub: number | null): Promise<void> {
  const { error } = await getSupabaseAdmin().from("estudiantes").update({ id_subclub: idSubclub }).eq("id_estudiante", idEstudiante);
  if (error) throw new Error(error.message);
}
