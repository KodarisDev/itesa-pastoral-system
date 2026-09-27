import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface BitacoraRow {
  id_bitacora: number;
  id_usuario: number | null;
  usuario_nombre: string | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  descripcion: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  creado_en: string;
}

export interface NuevaEntradaBitacora {
  id_usuario: number | null;
  usuario_nombre: string | null;
  accion: string;
  entidad: string;
  entidad_id?: string | null;
  descripcion?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
}

export async function insertarEntradaBitacora(entrada: NuevaEntradaBitacora): Promise<void> {
  const { error } = await getSupabaseAdmin().from("bitacora").insert(entrada);
  if (error) throw new Error(error.message);
}

/** Últimas entradas de la bitácora, más recientes primero. Solo para uso interno/depuración por ahora — no hay UI todavía. */
export async function getBitacora(limite = 200): Promise<BitacoraRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("bitacora")
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return data;
}
