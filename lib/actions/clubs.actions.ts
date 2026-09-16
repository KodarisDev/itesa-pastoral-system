"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/db/cached";
import { clubSchema } from "@/lib/validations/club.schema";
import {
  getClubById,
  crearClub,
  actualizarClub,
  eliminarClub,
  agregarEncargado,
  quitarEncargado,
  getEncargadosDeClub,
  getClubesDeUsuario,
  contarMiembros,
} from "@/lib/db/clubes";
import { getEstudianteById, actualizarEstudiante } from "@/lib/db/estudiantes";
import { getUsuarioByEstudianteId } from "@/lib/db/usuarios";
import { subirFotoClub, borrarFotoClub } from "@/lib/supabase/storage";
import { requirePermiso } from "@/lib/auth/guards";
import { actionOk, actionError, type ActionResult } from "./types";

export async function createClub(formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    await requirePermiso("clubes:gestionar");

    const parsed = clubSchema.safeParse({
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      capacidad: formData.get("capacidadMaxima") ?? formData.get("capacidad"),
      encargadoPrincipalId: formData.get("encargadoUsuarioId") || null,
      encargadoSecundarioId: formData.get("encargadoSecundarioUsuarioId") || null,
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos.");
    }

    const club = await crearClub({
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      capacidad: parsed.data.capacidad,
      foto: null,
    });

    const foto = formData.get("foto");
    if (foto instanceof File && foto.size > 0) {
      const fotoUrl = await subirFotoClub(club.id_club, foto);
      await actualizarClub(club.id_club, { foto: fotoUrl });
    }

    if (parsed.data.encargadoPrincipalId) {
      await agregarEncargado(club.id_club, parsed.data.encargadoPrincipalId, true);
    }
    if (parsed.data.encargadoSecundarioId) {
      await agregarEncargado(club.id_club, parsed.data.encargadoSecundarioId, false);
    }

    revalidatePath("/admin/clubes");
    revalidateTag(CACHE_TAGS.clubes);
    return actionOk({ id: club.id_club });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo crear el club.");
  }
}

export async function updateClub(clubId: number, formData: FormData): Promise<ActionResult> {
  try {
    await requirePermiso("clubes:gestionar");

    const club = await getClubById(clubId);
    if (!club) return actionError("El club no existe.");

    const parsed = clubSchema.safeParse({
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      capacidad: formData.get("capacidadMaxima") ?? formData.get("capacidad"),
      encargadoPrincipalId: formData.get("encargadoUsuarioId") || null,
      encargadoSecundarioId: formData.get("encargadoSecundarioUsuarioId") || null,
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos.");
    }

    let foto = club.foto;
    const nuevaFoto = formData.get("foto");
    if (nuevaFoto instanceof File && nuevaFoto.size > 0) {
      if (foto) await borrarFotoClub(foto).catch(() => {});
      foto = await subirFotoClub(clubId, nuevaFoto);
    }

    await actualizarClub(clubId, {
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      capacidad: parsed.data.capacidad,
      foto,
    });

    const encargados = await getEncargadosDeClub(clubId);
    const principalNuevoId = parsed.data.encargadoPrincipalId ?? null;
    const secundarioNuevoId = parsed.data.encargadoSecundarioId ?? null;

    // Quita cualquier encargado que no conserve su mismo rol — así un intercambio
    // principal <-> secundario libera ambas filas antes de recrearlas.
    for (const e of encargados) {
      const mantieneMismoRol =
        (e.encargado_principal && e.id_usuario === principalNuevoId) ||
        (!e.encargado_principal && e.id_usuario === secundarioNuevoId);
      if (!mantieneMismoRol) await quitarEncargado(clubId, e.id_usuario);
    }

    const encargadosActualizados = await getEncargadosDeClub(clubId);
    if (principalNuevoId && !encargadosActualizados.some((e) => e.id_usuario === principalNuevoId && e.encargado_principal)) {
      await agregarEncargado(clubId, principalNuevoId, true);
    }
    if (secundarioNuevoId && !encargadosActualizados.some((e) => e.id_usuario === secundarioNuevoId && !e.encargado_principal)) {
      await agregarEncargado(clubId, secundarioNuevoId, false);
    }

    revalidatePath("/admin/clubes");
    revalidatePath(`/admin/clubes/${clubId}`);
    revalidateTag(CACHE_TAGS.clubes);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo actualizar el club.");
  }
}

export async function deleteClub(clubId: number): Promise<ActionResult> {
  try {
    await requirePermiso("clubes:gestionar");
    const club = await getClubById(clubId);
    if (!club) return actionError("El club no existe.");
    await eliminarClub(clubId);
    revalidatePath("/admin/clubes");
    revalidateTag(CACHE_TAGS.clubes);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo eliminar el club.");
  }
}

export async function removeMiembroDeClub(clubId: number, estudianteId: number): Promise<ActionResult> {
  try {
    await requirePermiso("estudiantes:gestionar");

    const estudiante = await getEstudianteById(estudianteId);
    if (!estudiante) return actionError("El estudiante no existe.");
    if (estudiante.id_club !== clubId) return actionError("El estudiante no pertenece a este club.");

    const usuarioEncargado = await getUsuarioByEstudianteId(estudianteId);
    if (usuarioEncargado) {
      const susClubes = await getEncargadosDeClub(clubId);
      if (susClubes.some((e) => e.id_usuario === usuarioEncargado.id_usuario)) {
        return actionError("Este estudiante es encargado de este club — quítalo como encargado primero, no como miembro.");
      }
    }

    await actualizarEstudiante(estudianteId, { id_club: null });
    revalidatePath(`/admin/clubes/${clubId}`);
    revalidatePath("/admin/clubes");
    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin");
    revalidateTag(CACHE_TAGS.clubes);
    revalidateTag(CACHE_TAGS.estudiantes);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo quitar al estudiante del club.");
  }
}

export async function cambiarClubEstudiante(estudianteId: number, clubDestinoId: number): Promise<ActionResult> {
  try {
    await requirePermiso("estudiantes:gestionar");

    const clubDestino = await getClubById(clubDestinoId);
    if (!clubDestino) return actionError("El club no existe.");

    const estudiante = await getEstudianteById(estudianteId);
    if (!estudiante) return actionError("El estudiante no existe.");
    if (estudiante.id_club === clubDestinoId) {
      return actionError("El estudiante ya pertenece a ese club.");
    }

    const usuarioEncargado = await getUsuarioByEstudianteId(estudianteId);
    if (usuarioEncargado) {
      const encargos = await getClubesDeUsuario(usuarioEncargado.id_usuario);
      if (encargos.length > 0) {
        return actionError("Este estudiante es encargado de un club — no se le puede asignar a otro club aparte.");
      }
    }

    const cupo = (clubDestino.capacidad ?? Infinity) - (await contarMiembros(clubDestinoId));
    if (cupo <= 0) return actionError(`El club "${clubDestino.nombre}" ya no tiene cupo disponible.`);

    await actualizarEstudiante(estudianteId, { id_club: clubDestinoId });

    revalidatePath("/admin/clubes");
    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin");
    revalidateTag(CACHE_TAGS.clubes);
    revalidateTag(CACHE_TAGS.estudiantes);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo cambiar de club al estudiante.");
  }
}
