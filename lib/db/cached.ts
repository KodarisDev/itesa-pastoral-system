import { unstable_cache } from "next/cache";
import { getClubes, getEncargados } from "./clubes";
import { getEstudiantes } from "./estudiantes";
import { getUsuarios } from "./usuarios";
import { getConfiguracion } from "./configuracion";
import { getRoles } from "./roles";
import { getAsistenciaTodas, getAsistenciaPorClub } from "./asistencia";

/**
 * Tags de caché de datos (next/cache `unstable_cache`), invalidados desde las
 * acciones que escriben cada tabla vía `revalidateTag`. Sin esto, cada
 * cambio de módulo del panel vuelve a pegarle a Supabase por listados
 * completos (p. ej. los 627 estudiantes) aunque nada haya cambiado.
 */
export const CACHE_TAGS = {
  clubes: "clubes",
  estudiantes: "estudiantes",
  usuarios: "usuarios",
  configuracion: "configuracion",
  roles: "roles",
  asistencia: "asistencia",
} as const;

export const getClubesCached = unstable_cache(getClubes, ["db-clubes"], { tags: [CACHE_TAGS.clubes] });
export const getEncargadosCached = unstable_cache(getEncargados, ["db-encargados"], { tags: [CACHE_TAGS.clubes] });
export const getEstudiantesCached = unstable_cache(getEstudiantes, ["db-estudiantes"], { tags: [CACHE_TAGS.estudiantes] });
export const getUsuariosCached = unstable_cache(getUsuarios, ["db-usuarios"], { tags: [CACHE_TAGS.usuarios] });
export const getConfiguracionCached = unstable_cache(getConfiguracion, ["db-configuracion"], { tags: [CACHE_TAGS.configuracion] });
export const getRolesCached = unstable_cache(getRoles, ["db-roles"], { tags: [CACHE_TAGS.roles] });
export const getAsistenciaTodasCached = unstable_cache(getAsistenciaTodas, ["db-asistencia-todas"], { tags: [CACHE_TAGS.asistencia] });
export const getAsistenciaPorClubCached = unstable_cache(getAsistenciaPorClub, ["db-asistencia-por-club"], {
  tags: [CACHE_TAGS.asistencia],
});
