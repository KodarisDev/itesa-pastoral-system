import "server-only";
import { getPermisosDeRol, getPermisosDeUsuario } from "@/lib/db/roles";
import { getClubesDeUsuario } from "@/lib/db/clubes";
import type { Permission, Usuario } from "@/types";

export interface SesionResuelta {
  permisos: Permission[];
  clubIds: number[];
  clubPrincipalId: number | null;
}

/**
 * Resuelve los permisos efectivos de un usuario (los de su rol + los
 * concedidos directamente a él, p. ej. un "admin" con permisos a la carta —
 * ver Configuración > Administradores) y los clubes que dirige (vía encargados).
 */
export async function resolverSesion(usuario: Usuario): Promise<SesionResuelta> {
  const [permisosRol, permisosUsuario, encargos] = await Promise.all([
    getPermisosDeRol(usuario.id_rol),
    getPermisosDeUsuario(usuario.id_usuario),
    getClubesDeUsuario(usuario.id_usuario),
  ]);
  const permisos = Array.from(new Set([...permisosRol, ...permisosUsuario]));

  const clubIds = encargos.map((e) => e.id_club);
  const principal = encargos.find((e) => e.encargado_principal) ?? encargos[0];

  return {
    permisos,
    clubIds,
    clubPrincipalId: principal?.id_club ?? null,
  };
}

export function tienePermiso(permisos: Permission[] | undefined, permiso: Permission): boolean {
  return !!permisos?.includes(permiso);
}
