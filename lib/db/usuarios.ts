import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Usuario } from "@/types";

export async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await getSupabaseAdmin().from("usuarios").select("*").order("nombre");
  if (error) throw new Error(error.message);
  return data;
}

export async function getUsuarioByUsername(usuario: string): Promise<Usuario | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("usuarios")
    .select("*")
    .ilike("usuario", usuario)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getUsuarioById(idUsuario: number): Promise<Usuario | null> {
  const { data, error } = await getSupabaseAdmin().from("usuarios").select("*").eq("id_usuario", idUsuario).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Si el estudiante ya tiene una cuenta de encargado vinculada, la devuelve. */
export async function getUsuarioByEstudianteId(idEstudiante: number): Promise<Usuario | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("usuarios")
    .select("*")
    .eq("id_estudiante", idEstudiante)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function crearUsuario(usuario: Omit<Usuario, "id_usuario">): Promise<Usuario> {
  const { data, error } = await getSupabaseAdmin().from("usuarios").insert(usuario).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarUsuario(
  idUsuario: number,
  cambios: Partial<Omit<Usuario, "id_usuario">>,
): Promise<Usuario> {
  const { data, error } = await getSupabaseAdmin()
    .from("usuarios")
    .update(cambios)
    .eq("id_usuario", idUsuario)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function eliminarUsuario(idUsuario: number): Promise<void> {
  const { error } = await getSupabaseAdmin().from("usuarios").delete().eq("id_usuario", idUsuario);
  if (error) throw new Error(error.message);
}

export function hashPassword(plain: string) {
  return bcrypt.hashSync(plain, 10);
}

export function compararPassword(plain: string, hash: string) {
  return bcrypt.compareSync(plain, hash);
}
