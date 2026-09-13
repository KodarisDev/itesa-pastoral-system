import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Estudiante } from "@/types";

export async function getEstudiantes(): Promise<Estudiante[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("activo", true)
    .order("apellido");
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudianteById(idEstudiante: number): Promise<Estudiante | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("id_estudiante", idEstudiante)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudianteByMatricula(matricula: string): Promise<Estudiante | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("matricula", matricula.trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudiantesByIds(ids: number[]): Promise<Estudiante[]> {
  if (ids.length === 0) return [];
  const { data, error } = await getSupabaseAdmin().from("estudiantes").select("*").in("id_estudiante", ids);
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudiantesPorClub(idClub: number): Promise<Estudiante[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("id_club", idClub)
    .eq("activo", true)
    .order("apellido");
  if (error) throw new Error(error.message);
  return data;
}

/** Cantidad de miembros activos por club, para tarjetas/listas públicas. */
export async function getConteoMiembrosPorClub(): Promise<Map<number, number>> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("id_club")
    .eq("activo", true)
    .not("id_club", "is", null);
  if (error) throw new Error(error.message);
  const conteo = new Map<number, number>();
  for (const row of data) {
    if (row.id_club == null) continue;
    conteo.set(row.id_club, (conteo.get(row.id_club) ?? 0) + 1);
  }
  return conteo;
}

export async function crearEstudiante(estudiante: Omit<Estudiante, "id_estudiante">): Promise<Estudiante> {
  const { data, error } = await getSupabaseAdmin().from("estudiantes").insert(estudiante).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function crearEstudiantes(estudiantes: Omit<Estudiante, "id_estudiante">[]): Promise<Estudiante[]> {
  if (estudiantes.length === 0) return [];
  const { data, error } = await getSupabaseAdmin().from("estudiantes").insert(estudiantes).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarEstudiante(
  idEstudiante: number,
  cambios: Partial<Omit<Estudiante, "id_estudiante">>,
): Promise<Estudiante> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .update(cambios)
    .eq("id_estudiante", idEstudiante)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
