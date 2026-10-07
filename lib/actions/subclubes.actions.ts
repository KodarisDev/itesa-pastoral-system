"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/db/cached";
import { subclubSchema, type SubclubFormValues } from "@/lib/validations/subclub.schema";
import { getClubById } from "@/lib/db/clubes";
import { getEstudianteById, actualizarEstudiante } from "@/lib/db/estudiantes";
import { getUsuarioById } from "@/lib/db/usuarios";
import { getRolById } from "@/lib/db/roles";
import {
  crearSubclub,
  renombrarSubclub,
  eliminarSubclub,
  getSubclubById,
  asignarEstudianteASubclub,
  agregarEncargadoSubclub,
  quitarEncargadoSubclub,
} from "@/lib/db/subclubes";
import { requirePermisoEnSubclub } from "@/lib/auth/guards";
import { registrarBitacora } from "@/lib/audit";
import { actionOk, actionError, type ActionResult } from "./types";

/**
 * Quién puede gestionar los subclubes de un club: pastoral/admin (con el
 * permiso clubes:gestionar) o el encargado GENERAL de ese club. Los
 * encargados de subclub no pueden.
 */
async function autorizarGestionDeSubclubes(idClub: number) {
  const session = await auth();
  if (!session) throw new Error("No tienes permiso para realizar esta acción.");
  const esRolDelSistema = session.user.rolNombre === "pastoral" || session.user.rolNombre === "admin";
  if (esRolDelSistema) {
    if (!session.user.permisos.includes("clubes:gestionar")) throw new Error("No tienes permiso para realizar esta acción.");
  } else if (!session.user.clubGeneralIds.includes(idClub)) {
    throw new Error("Solo el encargado general del club puede gestionar sus subclubes.");
  }
  return session;
}

function revalidarSubclubes() {
  revalidatePath("/club/subclubes");
  revalidatePath("/club/miembros");
  revalidatePath("/club/asistencia");
  revalidatePath("/club/historial");
  revalidatePath("/admin/clubes");
  revalidatePath("/admin/asistencias");
  revalidateTag(CACHE_TAGS.subclubes);
  revalidatePath("/club/inscripcion");
  revalidatePath("/club");
  revalidatePath("/admin/estudiantes");
  revalidatePath("/admin/inscripcion");
  revalidateTag(CACHE_TAGS.estudiantes);
  revalidateTag(CACHE_TAGS.clubes);
  revalidateTag(CACHE_TAGS.asistencia);
}

export async function createSubclub(values: SubclubFormValues): Promise<ActionResult> {
  try {
    const parsed = subclubSchema.safeParse(values);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del subclub.");

    const session = await autorizarGestionDeSubclubes(parsed.data.clubId);
    const club = await getClubById(parsed.data.clubId);
    if (!club) return actionError("El club no existe.");

    const subclub = await crearSubclub(parsed.data.clubId, parsed.data.nombre);

    await registrarBitacora({
      session,
      accion: "subclub.crear",
      entidad: "subclub",
      entidadId: subclub.id_subclub,
      descripcion: `Creó el subclub "${subclub.nombre}" en el club "${club.nombre}".`,
      metadata: { clubId: club.id_club },
    });

    revalidarSubclubes();
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo crear el subclub.");
  }
}

export async function updateSubclub(subclubId: number, nombre: string): Promise<ActionResult> {
  try {
    const subclub = await getSubclubById(subclubId);
    if (!subclub) return actionError("El subclub no existe.");
    const parsed = subclubSchema.safeParse({ clubId: subclub.id_club, nombre });
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Revisa el nombre del subclub.");

    const session = await autorizarGestionDeSubclubes(subclub.id_club);
    await renombrarSubclub(subclubId, parsed.data.nombre);

    await registrarBitacora({
      session,
      accion: "subclub.actualizar",
      entidad: "subclub",
      entidadId: subclubId,
      descripcion: `Renombró el subclub "${subclub.nombre}" a "${parsed.data.nombre}".`,
      metadata: { clubId: subclub.id_club },
    });

    revalidarSubclubes();
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo actualizar el subclub.");
  }
}

export async function deleteSubclub(subclubId: number): Promise<ActionResult> {
  try {
    const subclub = await getSubclubById(subclubId);
    if (!subclub) return actionError("El subclub no existe.");
    const session = await autorizarGestionDeSubclubes(subclub.id_club);

    // Sus estudiantes quedan sin subclub (siguen en el club) y las asistencias
    // ya tomadas pasan a figurar sin subclub (FK on delete set null).
    await eliminarSubclub(subclubId);

    await registrarBitacora({
      session,
      accion: "subclub.eliminar",
      entidad: "subclub",
      entidadId: subclubId,
      descripcion: `Eliminó el subclub "${subclub.nombre}".`,
      metadata: { clubId: subclub.id_club },
    });

    revalidarSubclubes();
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo eliminar el subclub.");
  }
}

/** Asigna (o con `subclubId = null`, quita) un estudiante de un subclub. El estudiante debe estar ya inscrito en el club padre. */
export async function setSubclubDeEstudiante(
  estudianteId: number,
  subclubId: number | null,
  clubId: number,
): Promise<ActionResult> {
  try {
    const session = await autorizarGestionDeSubclubes(clubId);

    const estudiante = await getEstudianteById(estudianteId);
    if (!estudiante) return actionError("El estudiante no existe.");
    if (estudiante.id_club !== clubId) return actionError("El estudiante no está inscrito en este club.");

    let nombreSubclub: string | null = null;
    if (subclubId !== null) {
      const subclub = await getSubclubById(subclubId);
      if (!subclub || subclub.id_club !== clubId) return actionError("El subclub no pertenece a este club.");
      nombreSubclub = subclub.nombre;
    }

    await asignarEstudianteASubclub(estudianteId, subclubId);

    await registrarBitacora({
      session,
      accion: subclubId === null ? "subclub.quitar_miembro" : "subclub.agregar_miembro",
      entidad: "estudiante",
      entidadId: estudianteId,
      descripcion:
        subclubId === null
          ? `Quitó a ${estudiante.nombre} ${estudiante.apellido} de su subclub.`
          : `Asignó a ${estudiante.nombre} ${estudiante.apellido} al subclub "${nombreSubclub}".`,
      metadata: { clubId, subclubId, subclubAnteriorId: estudiante.id_subclub ?? null },
    });

    revalidarSubclubes();
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo actualizar el subclub del estudiante.");
  }
}

export async function addEncargadoSubclub(subclubId: number, usuarioId: number): Promise<ActionResult> {
  try {
    const subclub = await getSubclubById(subclubId);
    if (!subclub) return actionError("El subclub no existe.");
    const session = await autorizarGestionDeSubclubes(subclub.id_club);

    const usuario = await getUsuarioById(usuarioId);
    if (!usuario) return actionError("El usuario no existe.");
    const rol = await getRolById(usuario.id_rol);
    if (rol?.nombre !== "encargado_club") return actionError("Solo se pueden asignar usuarios con rol de encargado de club.");
    if (!usuario.activo) return actionError("Ese usuario está desactivado.");

    await agregarEncargadoSubclub(subclubId, usuarioId);

    await registrarBitacora({
      session,
      accion: "subclub.agregar_encargado",
      entidad: "subclub",
      entidadId: subclubId,
      descripcion: `Asignó a "${usuario.nombre}" como encargado del subclub "${subclub.nombre}".`,
      metadata: { clubId: subclub.id_club, usuarioId },
    });

    revalidarSubclubes();
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo asignar el encargado.");
  }
}

export async function removeEncargadoSubclub(subclubId: number, usuarioId: number): Promise<ActionResult> {
  try {
    const subclub = await getSubclubById(subclubId);
    if (!subclub) return actionError("El subclub no existe.");
    const session = await autorizarGestionDeSubclubes(subclub.id_club);

    await quitarEncargadoSubclub(subclubId, usuarioId);

    await registrarBitacora({
      session,
      accion: "subclub.quitar_encargado",
      entidad: "subclub",
      entidadId: subclubId,
      descripcion: `Quitó al usuario #${usuarioId} como encargado del subclub "${subclub.nombre}".`,
      metadata: { clubId: subclub.id_club, usuarioId },
    });

    revalidarSubclubes();
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo quitar al encargado.");
  }
}

/**
 * Encargado de subclub (o general / pastoral / admin) agrega a un estudiante a un subclub.
 * Solo estudiantes ya inscritos en el club padre y que aún no tengan subclub.
 */
export async function inscribirEnSubclub(estudianteId: number, subclubId: number): Promise<ActionResult> {
  try {
    const subclub = await getSubclubById(subclubId);
    if (!subclub) return actionError("El subclub no existe.");
    const session = await requirePermisoEnSubclub("estudiantes:inscribir", subclubId, subclub.id_club);

    const club = await getClubById(subclub.id_club);
    if (!club) return actionError("El club del subclub no existe.");

    const estudiante = await getEstudianteById(estudianteId);
    if (!estudiante || !estudiante.activo) return actionError("El estudiante no existe en el listado vigente.");
    const nombre = `${estudiante.nombre} ${estudiante.apellido}`;

    if (estudiante.id_club !== club.id_club) {
      return actionError(`${nombre} no está inscrito en el club "${club.nombre}".`);
    }
    if (estudiante.id_subclub != null) {
      return actionError(`${nombre} ya pertenece a un subclub.`);
    }

    await actualizarEstudiante(estudianteId, { id_subclub: subclubId });

    await registrarBitacora({
      session,
      accion: "subclub.inscribir_miembro",
      entidad: "estudiante",
      entidadId: estudianteId,
      descripcion: `Agregó a ${nombre} al subclub "${subclub.nombre}" del club "${club.nombre}".`,
      metadata: { clubId: club.id_club, subclubId },
    });

    revalidarSubclubes();
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo agregar al estudiante al subclub.");
  }
}
