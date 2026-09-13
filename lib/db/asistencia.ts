import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type RegistroAsistencia = Database["public"]["Tables"]["asistencia"]["Row"];
export type NuevoRegistroAsistencia = Database["public"]["Tables"]["asistencia"]["Insert"];

export async function getAsistenciaDia(idClub: number, fecha: string): Promise<RegistroAsistencia[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("asistencia")
    .select("*")
    .eq("id_club", idClub)
    .eq("fecha", fecha);
  if (error) throw new Error(error.message);
  return data;
}

export async function getAsistenciaPorClub(idClub: number): Promise<RegistroAsistencia[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("asistencia")
    .select("*")
    .eq("id_club", idClub)
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getAsistenciaPorEstudiante(idEstudiante: number): Promise<RegistroAsistencia[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("asistencia")
    .select("*")
    .eq("id_estudiante", idEstudiante)
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getAsistenciaTodas(): Promise<RegistroAsistencia[]> {
  const { data, error } = await getSupabaseAdmin().from("asistencia").select("*").order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

/** Upsert por (id_estudiante, fecha) — pasar lista dos veces el mismo día actualiza el registro. */
export async function guardarAsistencia(registros: NuevoRegistroAsistencia[]): Promise<void> {
  if (registros.length === 0) return;
  const { error } = await getSupabaseAdmin()
    .from("asistencia")
    .upsert(registros, { onConflict: "id_estudiante,fecha" });
  if (error) throw new Error(error.message);
}
