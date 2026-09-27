import "server-only";
import { insertarEntradaBitacora } from "@/lib/db/bitacora";

/**
 * Identidad mínima necesaria para registrar quién hizo una acción — una
 * sesión real de NextAuth encaja aquí sin conversión, pero también acepta un
 * objeto armado a mano para casos sin sesión completa (ej. un login que
 * recién se autenticó y todavía no tiene JWT, o un intento fallido). `null`
 * cuando la acción fue anónima o no se pudo identificar a nadie.
 */
type ActorSesion = { user: { id: string | number; name?: string | null } } | null;

export interface RegistrarBitacoraParams {
  /** La sesión de quien ejecuta la acción (lo que devuelve `auth()`/`requirePermiso()`). `null` si no hay sesión (p. ej. un intento de login fallido). */
  session: ActorSesion;
  /** Identificador corto y estable de la acción, en punto: "<entidad>.<verbo>" (ej. "club.crear", "asistencia.pasar"). */
  accion: string;
  /** Tipo de entidad afectada (ej. "club", "estudiante", "usuario", "asistencia", "configuracion", "sesion"). */
  entidad: string;
  /** Id de la fila afectada, si aplica. */
  entidadId?: number | string | null;
  /** Resumen legible en español de qué pasó, para leer la bitácora sin tener que interpretar `metadata`. */
  descripcion?: string;
  /** Datos estructurados adicionales (valores antes/después, filtros usados, etc.). */
  metadata?: Record<string, unknown> | null;
  /** IP del cliente, cuando se conoce (rutas de API que ya la leen de los headers). */
  ip?: string | null;
}

/**
 * Inserta una fila en la bitácora de auditoría. Se llama DESPUÉS de que la
 * acción real ya se ejecutó con éxito — nunca antes, y nunca condiciona el
 * resultado de la acción: si el registro falla (p. ej. la tabla no existe
 * todavía, o hay un problema de red con Supabase), se traga el error y solo
 * lo deja en la consola del servidor, para que un log roto jamás le impida a
 * un usuario guardar su asistencia, crear un club, etc.
 */
export async function registrarBitacora(params: RegistrarBitacoraParams): Promise<void> {
  try {
    const usuario = params.session?.user;
    await insertarEntradaBitacora({
      id_usuario: usuario ? Number(usuario.id) : null,
      usuario_nombre: usuario?.name ?? null,
      accion: params.accion,
      entidad: params.entidad,
      entidad_id: params.entidadId != null ? String(params.entidadId) : null,
      descripcion: params.descripcion ?? null,
      metadata: params.metadata ?? null,
      ip: params.ip ?? null,
    });
  } catch (err) {
    console.error(`[bitacora] No se pudo registrar "${params.accion}":`, err);
  }
}
