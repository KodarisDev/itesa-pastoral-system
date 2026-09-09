import { readJson, writeJson, withFileLock } from "./base";
import type { SolicitudInscripcion } from "@/types";

const FILE = "solicitudes.json";

export const getSolicitudes = () => readJson<SolicitudInscripcion[]>(FILE, []);

export async function getSolicitudById(id: string) {
  const list = await getSolicitudes();
  return list.find((s) => s.id === id) ?? null;
}

export function addSolicitud(solicitud: SolicitudInscripcion) {
  return withFileLock(FILE, async () => {
    const list = await readJson<SolicitudInscripcion[]>(FILE, []);
    list.push(solicitud);
    await writeJson(FILE, list);
    return solicitud;
  });
}

export function saveSolicitud(solicitud: SolicitudInscripcion) {
  return withFileLock(FILE, async () => {
    const list = await readJson<SolicitudInscripcion[]>(FILE, []);
    const idx = list.findIndex((s) => s.id === solicitud.id);
    if (idx >= 0) list[idx] = solicitud;
    else list.push(solicitud);
    await writeJson(FILE, list);
    return solicitud;
  });
}

/** Reemplaza varias solicitudes a la vez (usado por sorteo/asignación automática). */
export function saveSolicitudes(solicitudes: SolicitudInscripcion[]) {
  return withFileLock(FILE, async () => {
    const list = await readJson<SolicitudInscripcion[]>(FILE, []);
    const byId = new Map(list.map((s) => [s.id, s] as const));
    for (const s of solicitudes) byId.set(s.id, s);
    const next = Array.from(byId.values());
    await writeJson(FILE, next);
    return next;
  });
}
