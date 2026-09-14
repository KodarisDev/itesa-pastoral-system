import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Configuracion } from "@/types";

/** Configuración global de pastoral: un único registro (se crea la primera vez que se guarda). */
export async function getConfiguracion(): Promise<Configuracion | null> {
  const { data, error } = await getSupabaseAdmin().from("configuracion").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function guardarConfiguracion(cambios: {
  dia_club: string | null;
  hora_club: string | null;
}): Promise<Configuracion> {
  const admin = getSupabaseAdmin();
  const actual = await getConfiguracion();

  if (actual) {
    const { data, error } = await admin
      .from("configuracion")
      .update(cambios)
      .eq("id_configuracion", actual.id_configuracion)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await admin.from("configuracion").insert(cambios).select().single();
  if (error) throw new Error(error.message);
  return data;
}
