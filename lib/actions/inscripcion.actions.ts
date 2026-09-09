"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { inscripcionSchema, type InscripcionFormValues } from "@/lib/validations/inscripcion.schema";
import { getClubes, getClubById, saveClub } from "@/lib/db/clubes";
import { getEstudianteById } from "@/lib/db/estudiantes";
import { actionOk, actionError, type ActionResult } from "./types";

async function requirePastoral() {
  const session = await auth();
  if (!session || session.user.rol !== "pastoral") {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  return session;
}

function cupoDisponible(capacidadMaxima: number, miembros: string[]) {
  return capacidadMaxima - miembros.length;
}

export async function inscribirEstudianteEnMiClub(estudianteId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session || session.user.rol !== "encargado_club" || !session.user.clubId) {
      return actionError("No tienes permiso para realizar esta acción.");
    }

    const estudiante = await getEstudianteById(estudianteId);
    if (!estudiante) return actionError("El estudiante no existe en el listado vigente.");

    const clubes = await getClubes();
    const clubActual = clubes.find((c) => c.miembrosActuales.includes(estudiante.id));
    if (clubActual) {
      return actionError(`${estudiante.nombre} ${estudiante.apellido} ya está inscrito en un club.`);
    }

    const miClub = clubes.find((c) => c.id === session.user.clubId);
    if (!miClub) return actionError("Tu club no existe.");
    if (cupoDisponible(miClub.capacidadMaxima, miClub.miembrosActuales) <= 0) {
      return actionError("Tu club ya no tiene cupo disponible.");
    }

    await saveClub({ ...miClub, miembrosActuales: [...miClub.miembrosActuales, estudiante.id] });

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
    await requirePastoral();

    const parsed = inscripcionSchema.safeParse(values);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const estudiante = await getEstudianteById(parsed.data.estudianteId);
    if (!estudiante) return actionError("El estudiante no existe en el listado vigente.");

    const clubes = await getClubes();
    const clubActual = clubes.find((c) => c.miembrosActuales.includes(estudiante.id));
    if (clubActual) {
      return actionError(
        `${estudiante.nombre} ${estudiante.apellido} ya está inscrito en "${clubActual.nombre}". Quítalo de ese club antes de inscribirlo en otro.`,
      );
    }

    const club = await getClubById(parsed.data.clubId);
    if (!club) return actionError("El club seleccionado no existe.");
    if (cupoDisponible(club.capacidadMaxima, club.miembrosActuales) <= 0) {
      return actionError(`El club "${club.nombre}" ya no tiene cupo disponible.`);
    }

    await saveClub({ ...club, miembrosActuales: [...club.miembrosActuales, estudiante.id] });

    revalidatePath("/admin/inscripcion");
    revalidatePath("/admin/clubes");
    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo inscribir al estudiante.");
  }
}
