import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Permission, Rol } from "@/types";

export async function getRoles(): Promise<Rol[]> {
  const { data, error } = await getSupabaseAdmin().from("roles").select("*").order("nombre");
  if (error) throw new Error(error.message);
  return data;
}

export async function getRolById(idRol: number): Promise<Rol | null> {
  const { data, error } = await getSupabaseAdmin().from("roles").select("*").eq("id_rol", idRol).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Devuelve los permisos (strings) de un rol. */
export async function getPermisosDeRol(idRol: number): Promise<Permission[]> {
  const { data, error } = await getSupabaseAdmin().from("permisos").select("permiso").eq("id_rol", idRol);
  if (error) throw new Error(error.message);
  return data.map((p) => p.permiso as Permission);
}

export function guardarPermisosDeRol(idRol: number, permisos: Permission[]) {
  const admin = getSupabaseAdmin();
  return (async () => {
    const { error: delError } = await admin.from("permisos").delete().eq("id_rol", idRol);
    if (delError) throw new Error(delError.message);
    if (permisos.length === 0) return;
    const { error: insError } = await admin
      .from("permisos")
      .insert(permisos.map((permiso) => ({ id_rol: idRol, permiso })));
    if (insError) throw new Error(insError.message);
  })();
}

/**
 * Permisos concedidos directamente a un usuario (además de los de su rol) —
 * ver Configuración > Administradores. Tolera que la tabla `usuario_permisos`
 * todavía no exista (antes de correr la migración SQL): en ese caso no hay
 * usuarios "admin" todavía, así que no afecta a nadie tratarlo como "sin
 * permisos extra" en vez de romper el login.
 */
export async function getPermisosDeUsuario(idUsuario: number): Promise<Permission[]> {
  const { data, error } = await getSupabaseAdmin().from("usuario_permisos").select("permiso").eq("id_usuario", idUsuario);
  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") return [];
    throw new Error(error.message);
  }
  return data.map((p) => p.permiso as Permission);
}

export function guardarPermisosDeUsuario(idUsuario: number, permisos: Permission[]) {
  const admin = getSupabaseAdmin();
  return (async () => {
    const { error: delError } = await admin.from("usuario_permisos").delete().eq("id_usuario", idUsuario);
    if (delError) throw new Error(delError.message);
    if (permisos.length === 0) return;
    const { error: insError } = await admin
      .from("usuario_permisos")
      .insert(permisos.map((permiso) => ({ id_usuario: idUsuario, permiso })));
    if (insError) throw new Error(insError.message);
  })();
}
