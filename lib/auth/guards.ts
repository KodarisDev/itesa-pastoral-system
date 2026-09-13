import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { tienePermiso } from "./permisos";
import type { Permission } from "@/types";

/** Lanza si no hay sesión o si el rol no tiene el permiso pedido. Úsalo al inicio de cada Server Action. */
export async function requirePermiso(permiso: Permission) {
  const session = await auth();
  if (!session || !tienePermiso(session.user.permisos, permiso)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  return session;
}

/**
 * Como requirePermiso, pero para usar al inicio de una página (Server
 * Component) de /admin: en vez de lanzar, redirige a /unauthorized. Es la
 * segunda capa de defensa para administradores con permisos configurables —
 * el menú lateral ya oculta lo que no pueden usar, esto bloquea el acceso
 * directo por URL.
 */
export async function requireVista(permiso: Permission) {
  const session = await auth();
  if (!session || !tienePermiso(session.user.permisos, permiso)) {
    redirect("/unauthorized");
  }
  return session;
}

/** Como requirePermiso, pero además exige que el club en cuestión sea uno de los que dirige (o que sea un rol no ligado a un club, como pastoral o admin). */
export async function requirePermisoEnClub(permiso: Permission, idClub: number) {
  const session = await requirePermiso(permiso);
  const esRolDelSistema = session.user.rolNombre === "pastoral" || session.user.rolNombre === "admin";
  if (!esRolDelSistema && !session.user.clubIds.includes(idClub)) {
    throw new Error("Solo puedes hacer esto en un club que diriges.");
  }
  return session;
}
