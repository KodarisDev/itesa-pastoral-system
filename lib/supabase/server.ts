import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase para uso EXCLUSIVO del servidor (Server Actions, Route
 * Handlers, Server Components). Usa la service_role key, que ignora RLS por
 * completo — nunca se debe importar este archivo desde un Client Component
 * ni exponer SUPABASE_SERVICE_ROLE_KEY con el prefijo NEXT_PUBLIC_.
 */
function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Revisa .env.local (ver .env.example).`,
    );
  }
  return value;
}

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!client) {
    client = createClient<Database>(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}
