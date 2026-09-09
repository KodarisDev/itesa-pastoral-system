"use server";

import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { clubSchema } from "@/lib/validations/club.schema";
import { getClubById, getClubes, saveClub, deleteClub as dbDeleteClub } from "@/lib/db/clubes";
import { getUsuarioById, saveUsuario } from "@/lib/db/usuarios";
import { appendHistorial } from "@/lib/db/historial";
import { generarId } from "@/lib/utils";
import { MAX_FOTO_CLUB_BYTES, TIPOS_FOTO_CLUB_PERMITIDOS } from "@/lib/constants";
import type { HistorialClub } from "@/types";
import { actionOk, actionError, type ActionResult } from "./types";

async function requirePastoral() {
  const session = await auth();
  if (!session || session.user.rol !== "pastoral") {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  return session;
}

const EXT_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function guardarFotoClub(clubId: string, foto: File): Promise<string> {
  if (!TIPOS_FOTO_CLUB_PERMITIDOS.includes(foto.type)) {
    throw new Error("La foto debe ser JPG, PNG o WEBP.");
  }
  if (foto.size > MAX_FOTO_CLUB_BYTES) {
    throw new Error("La foto no puede pesar más de 2MB.");
  }
  const ext = EXT_POR_TIPO[foto.type] ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "clubs");
  await fs.mkdir(dir, { recursive: true });
  const filename = `${clubId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await foto.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/clubs/${filename}`;
}

export async function createClub(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePastoral();

    const parsed = clubSchema.safeParse({
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      capacidadMaxima: formData.get("capacidadMaxima"),
      duracionMeses: formData.get("duracionMeses"),
      encargadoUsuarioId: formData.get("encargadoUsuarioId") || null,
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos.");
    }

    const id = generarId("club");
    const hoy = new Date().toISOString().slice(0, 10);
    const anioEscolar = new Date().getFullYear().toString();

    let fotoUrl: string | null = null;
    const foto = formData.get("foto");
    if (foto instanceof File && foto.size > 0) {
      fotoUrl = await guardarFotoClub(id, foto);
    }

    await saveClub({
      id,
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      fotoUrl,
      capacidadMaxima: parsed.data.capacidadMaxima,
      duracionMeses: parsed.data.duracionMeses,
      encargadoUsuarioId: parsed.data.encargadoUsuarioId ?? null,
      cicloActual: { numero: 1, fechaInicio: hoy, anioEscolar },
      miembrosActuales: [],
    });

    if (parsed.data.encargadoUsuarioId) {
      const usuario = await getUsuarioById(parsed.data.encargadoUsuarioId);
      if (usuario) await saveUsuario({ ...usuario, clubId: id });
    }

    revalidatePath("/admin/clubes");
    return actionOk({ id });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo crear el club.");
  }
}

export async function updateClub(clubId: string, formData: FormData): Promise<ActionResult> {
  try {
    await requirePastoral();

    const club = await getClubById(clubId);
    if (!club) return actionError("El club no existe.");

    const parsed = clubSchema.safeParse({
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      capacidadMaxima: formData.get("capacidadMaxima"),
      duracionMeses: formData.get("duracionMeses"),
      encargadoUsuarioId: formData.get("encargadoUsuarioId") || null,
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos.");
    }

    if (parsed.data.capacidadMaxima < club.miembrosActuales.length) {
      return actionError(
        `No puedes bajar el cupo a ${parsed.data.capacidadMaxima}: el club ya tiene ${club.miembrosActuales.length} miembros.`,
      );
    }

    let fotoUrl = club.fotoUrl;
    const foto = formData.get("foto");
    if (foto instanceof File && foto.size > 0) {
      fotoUrl = await guardarFotoClub(clubId, foto);
    }

    const encargadoAnteriorId = club.encargadoUsuarioId;
    const encargadoNuevoId = parsed.data.encargadoUsuarioId ?? null;

    await saveClub({
      ...club,
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      fotoUrl,
      capacidadMaxima: parsed.data.capacidadMaxima,
      duracionMeses: parsed.data.duracionMeses,
      encargadoUsuarioId: encargadoNuevoId,
    });

    if (encargadoAnteriorId && encargadoAnteriorId !== encargadoNuevoId) {
      const anterior = await getUsuarioById(encargadoAnteriorId);
      if (anterior) await saveUsuario({ ...anterior, clubId: undefined });
    }
    if (encargadoNuevoId && encargadoNuevoId !== encargadoAnteriorId) {
      const nuevo = await getUsuarioById(encargadoNuevoId);
      if (nuevo) await saveUsuario({ ...nuevo, clubId });
    }

    revalidatePath("/admin/clubes");
    revalidatePath(`/admin/clubes/${clubId}`);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo actualizar el club.");
  }
}

export async function deleteClub(clubId: string): Promise<ActionResult> {
  try {
    await requirePastoral();
    const club = await getClubById(clubId);
    if (!club) return actionError("El club no existe.");
    if (club.miembrosActuales.length > 0) {
      return actionError("No puedes eliminar un club que todavía tiene miembros. Inicia un nuevo ciclo primero o reasigna a sus miembros.");
    }
    await dbDeleteClub(clubId);
    revalidatePath("/admin/clubes");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo eliminar el club.");
  }
}

export async function startNewCycle(clubId: string): Promise<ActionResult<{ archivados: number }>> {
  try {
    await requirePastoral();
    const club = await getClubById(clubId);
    if (!club) return actionError("El club no existe.");

    const hoy = new Date().toISOString().slice(0, 10);

    if (club.miembrosActuales.length > 0) {
      const entradas: HistorialClub[] = club.miembrosActuales.map((estudianteId) => ({
        id: generarId("hist"),
        estudianteId,
        clubId: club.id,
        clubNombre: club.nombre,
        anioEscolar: club.cicloActual.anioEscolar,
        cicloNumero: club.cicloActual.numero,
        fechaInicio: club.cicloActual.fechaInicio,
        fechaFin: hoy,
        motivoArchivo: "nuevo_ciclo",
      }));
      await appendHistorial(entradas);
    }

    await saveClub({
      ...club,
      miembrosActuales: [],
      cicloActual: {
        numero: club.cicloActual.numero + 1,
        fechaInicio: hoy,
        anioEscolar: club.cicloActual.anioEscolar,
      },
    });

    revalidatePath("/admin/clubes");
    revalidatePath(`/admin/clubes/${clubId}`);
    return actionOk({ archivados: club.miembrosActuales.length });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo iniciar el nuevo ciclo.");
  }
}

export async function removeMiembroDeClub(clubId: string, estudianteId: string): Promise<ActionResult> {
  try {
    await requirePastoral();
    const club = await getClubById(clubId);
    if (!club) return actionError("El club no existe.");
    await saveClub({
      ...club,
      miembrosActuales: club.miembrosActuales.filter((id) => id !== estudianteId),
    });
    revalidatePath(`/admin/clubes/${clubId}`);
    revalidatePath("/admin/clubes");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo quitar al estudiante del club.");
  }
}

