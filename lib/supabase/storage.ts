import "server-only";
import { getSupabaseAdmin } from "./server";
import { MAX_FOTO_CLUB_BYTES, TIPOS_FOTO_CLUB_PERMITIDOS } from "@/lib/constants";

/** Nombre del bucket de Storage — créalo en el dashboard de Supabase con este mismo nombre. */
export const CLUB_FOTOS_BUCKET = "club-fotos";

const EXT_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Sube la foto de un club y devuelve la URL pública para guardar en clubes.foto. */
export async function subirFotoClub(clubId: number | string, foto: File): Promise<string> {
  if (!TIPOS_FOTO_CLUB_PERMITIDOS.includes(foto.type)) {
    throw new Error("La foto debe ser JPG, PNG o WEBP.");
  }
  if (foto.size > MAX_FOTO_CLUB_BYTES) {
    throw new Error("La foto no puede pesar más de 2MB.");
  }
  const ext = EXT_POR_TIPO[foto.type] ?? "jpg";
  const path = `${clubId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await foto.arrayBuffer());

  const { error } = await getSupabaseAdmin()
    .storage.from(CLUB_FOTOS_BUCKET)
    .upload(path, buffer, { contentType: foto.type, upsert: false });

  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);

  const { data } = getSupabaseAdmin().storage.from(CLUB_FOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Borra una foto de club a partir de su URL pública (no falla si ya no existe). */
export async function borrarFotoClub(urlPublica: string): Promise<void> {
  const marcador = `/object/public/${CLUB_FOTOS_BUCKET}/`;
  const idx = urlPublica.indexOf(marcador);
  if (idx === -1) return;
  const path = urlPublica.slice(idx + marcador.length);
  await getSupabaseAdmin().storage.from(CLUB_FOTOS_BUCKET).remove([path]);
}
