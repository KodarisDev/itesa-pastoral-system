"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { inscripcionSchema, type InscripcionFormValues } from "@/lib/validations/inscripcion.schema";
import { getClubById, contarMiembros } from "@/lib/db/clubes";
import { getEstudianteById, actualizarEstudiante } from "@/lib/db/estudiantes";
import { requirePermiso, requirePermisoEnClub } from "@/lib/auth/guards";
import { actionOk, actionError, type ActionResult } from "./types";

export async function inscribirEstudianteEnMiClub(estudianteId: number): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session || session.user.clubIds.length === 0) {
      return actionError("No tienes permiso para realizar esta acción.");
    }
    const idClub = session.user.clubPrincipalId ?? session.user.clubIds[0];
    await requirePermisoEnClub("estudiantes:inscribir", idClub);

    const estudiante = await getEstudianteById(estudianteId);
    if (!estudiante) return actionError("El estudiante no existe en el listado vigente.");
    if (estudiante.id_club) {
      return actionError(`${estudiante.nombre} ${estudiante.apellido} ya está inscrito en un club.`);
    }

    const club = await getClubById(idClub);
    if (!club) return actionError("Tu club no existe.");
    const cupo = (club.capacidad ?? Infinity) - (await contarMiembros(idClub));
    if (cupo <= 0) return actionError("Tu club ya no tiene cupo disponible.");

    await actualizarEstudiante(estudianteId, { id_club: idClub });

    revalidatePath("/club/inscripcion");
    revalidatePath("/club/miembros");
    revalidatePath("/club");
    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin/clubes");
    revalidatePath("/admin");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo inscribir al estudiante.");
  }
}

export async function inscribirEstudiante(values: InscripcionFormValues): Promise<ActionResult> {
  try {
    await requirePermiso("estudiantes:inscribir");

    const parsed = inscripcionSchema.safeParse(values);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const estudiante = await getEstudianteById(parsed.data.estudianteId);
    if (!estudiante) return actionError("El estudiante no existe en el listado vigente.");
    if (estudiante.id_club) {
      return actionError(`${estudiante.nombre} ${estudiante.apellido} ya está inscrito en un club. Quítalo de ese club antes de inscribirlo en otro.`);
    }

    const club = await getClubById(parsed.data.clubId);
    if (!club) return actionError("El club seleccionado no existe.");
    const cupo = (club.capacidad ?? Infinity) - (await contarMiembros(parsed.data.clubId));
    if (cupo <= 0) return actionError(`El club "${club.nombre}" ya no tiene cupo disponible.`);

    await actualizarEstudiante(parsed.data.estudianteId, { id_club: parsed.data.clubId });

    revalidatePath("/admin/inscripcion");
    revalidatePath("/admin/clubes");
    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo inscribir al estudiante.");
  }
}
