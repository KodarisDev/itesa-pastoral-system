"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { asistenciaSchema, type AsistenciaFormValues } from "@/lib/validations/attendance.schema";
import { guardarAsistencia } from "@/lib/db/asistencia";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { requirePermisoEnClub } from "@/lib/auth/guards";
import { actionOk, actionError, type ActionResult } from "./types";

export async function submitAttendance(values: AsistenciaFormValues): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session) return actionError("No tienes permiso para pasar lista.");

    const parsed = asistenciaSchema.safeParse(values);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos de la asistencia.");
    }

    await requirePermisoEnClub("asistencia:pasar", parsed.data.clubId);

    const miembros = await getEstudiantesPorClub(parsed.data.clubId);
    const idsValidos = new Set(miembros.map((m) => m.id_estudiante));

    const registros = parsed.data.registros
      .filter((r) => idsValidos.has(r.estudianteId))
      .map((r) => ({
        id_estudiante: r.estudianteId,
        id_club: parsed.data.clubId,
        fecha: parsed.data.fecha,
        estado: r.presente ? ("Presente" as const) : r.justificacion ? ("Justificado" as const) : ("Ausente" as const),
        nota: r.justificacion ?? null,
        id_usuario: Number(session.user.id),
      }));

    await guardarAsistencia(registros);

    revalidatePath("/club/asistencia");
    revalidatePath("/club/historial");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo guardar la asistencia. Inténtalo de nuevo.");
  }
}
