"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { asistenciaSchema, type AsistenciaFormValues } from "@/lib/validations/attendance.schema";
import { saveAsistencia } from "@/lib/db/asistencias";
import { getClubById } from "@/lib/db/clubes";
import { getMeta } from "@/lib/db/meta";
import { generarId } from "@/lib/utils";
import { actionOk, actionError, type ActionResult } from "./types";

export async function submitAttendance(values: AsistenciaFormValues): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session || session.user.rol !== "encargado_club") {
      return actionError("No tienes permiso para pasar lista.");
    }

    const parsed = asistenciaSchema.safeParse(values);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos de la asistencia.");
    }

    if (session.user.clubId !== parsed.data.clubId) {
      return actionError("Solo puedes pasar lista en el club que tienes asignado.");
    }

    const club = await getClubById(parsed.data.clubId);
    if (!club) return actionError("El club no existe.");

    const idsValidos = new Set(club.miembrosActuales);
    const registrosFiltrados = parsed.data.registros.filter((r) => idsValidos.has(r.estudianteId));

    const meta = await getMeta();

    await saveAsistencia({
      id: generarId("asis"),
      clubId: parsed.data.clubId,
      fecha: parsed.data.fecha,
      registros: registrosFiltrados,
      tomadaPorUsuarioId: session.user.id,
      anioEscolar: meta.anioActual,
    });

    revalidatePath("/club/asistencia");
    revalidatePath("/club/historial");
    return actionOk(undefined);
  } catch {
    return actionError("No se pudo guardar la asistencia. Inténtalo de nuevo.");
  }
}
