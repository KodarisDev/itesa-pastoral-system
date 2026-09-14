"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/db/cached";
import { auth } from "@/lib/auth";
import { asistenciaSchema, type AsistenciaFormValues } from "@/lib/validations/attendance.schema";
import { guardarAsistencia } from "@/lib/db/asistencia";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { getConfiguracion } from "@/lib/db/configuracion";
import { calcularVentanaAsistencia } from "@/lib/asistencia-ventana";
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

    const configuracion = await getConfiguracion();
    const ventana = calcularVentanaAsistencia(configuracion);
    if (!ventana.abierta) {
      return actionError("Fuera del horario de pastoral: solo puedes pasar lista durante las 24 horas después del horario configurado.");
    }

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
    revalidateTag(CACHE_TAGS.asistencia);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo guardar la asistencia. Inténtalo de nuevo.");
  }
}
