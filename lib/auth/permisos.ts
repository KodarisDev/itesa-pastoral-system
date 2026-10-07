import "server-only";
import { getPermisosDeRol, getPermisosDeUsuario } from "@/lib/db/roles";
import { getClubesDeUsuario } from "@/lib/db/clubes";
import { getSubclubesDeUsuario } from "@/lib/db/subclubes";
import type { Permission, Usuario } from "@/types";

export interface SesionResuelta {
  permisos: Permission[];
  /** Clubes que puede ver: los que dirige + los padres de sus subclubes. */
  clubIds: number[];
  /** Clubes que dirige como encargado general (pueden gestionar subclubes e inscribir). */
  clubGeneralIds: number[];
  /** Subclubes donde es encargado (pasa lista solo en ellos). */
  subclubIds: number[];
  clubPrincipalId: number | null;
}

/**
 * Resuelve los permisos efectivos de un usuario (los de su rol + los
 * concedidos directamente a él, p. ej. un "admin" con permisos a la carta —
 * ver Configuración > Administradores) y los clubes que dirige (vía encargados).
 */
export async function resolverSesion(usuario: Usuario): Promise<SesionResuelta> {
  const [permisosRol, permisosUsuario, encargos, encargosSubclub] = await Promise.all([
    getPermisosDeRol(usuario.id_rol),
    getPermisosDeUsuario(usuario.id_usuario),
    getClubesDeUsuario(usuario.id_usuario),
    getSubclubesDeUsuario(usuario.id_usuario),
  ]);
  const permisos = Array.from(new Set([...permisosRol, ...permisosUsuario]));

  const clubGeneralIds = encargos.map((e) => e.id_club);
  const subclubIds = encargosSubclub.map((e) => e.id_subclub);
  // Un encargado de subclub ve todo el club padre, aunque no sea encargado general.
  const clubIds = Array.from(new Set([...clubGeneralIds, ...encargosSubclub.map((e) => e.id_club)]));
  const principal = encargos.find((e) => e.encargado_principal) ?? encargos[0];

  return {
    permisos,
    clubIds,
    clubGeneralIds,
    subclubIds,
    clubPrincipalId: principal?.id_club ?? clubIds[0] ?? null,
  };
}

export function tienePermiso(permisos: Permission[] | undefined, permiso: Permission): boolean {
  return !!permisos?.includes(permiso);
}

/** Encargado que solo dirige subclubes (no es encargado general de ningún club): su panel gira en torno a su subclub. */
export function esSoloEncargadoDeSubclub(user: { clubGeneralIds: number[]; subclubIds: number[] }): boolean {
  return user.clubGeneralIds.length === 0 && user.subclubIds.length > 0;
}
