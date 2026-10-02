"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/db/cached";
import { auth } from "@/lib/auth";
import { asistenciaSchema, type AsistenciaFormValues } from "@/lib/validations/attendance.schema";
import { guardarAsistencia } from "@/lib/db/asistencia";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { getConfiguracion } from "@/lib/db/configuracion";
import { calcularVentanaAsistencia } from "@/lib/asistencia-ventana";
import { requirePermisoComoEncargadoGeneral, requirePermisoEnSubclub } from "@/lib/auth/guards";
import { getSubclubById } from "@/lib/db/subclubes";
import { registrarBitacora } from "@/lib/audit";
import { actionOk, actionError, type ActionResult } from "./types";

export async function submitAttendance(values: AsistenciaFormValues): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session) return actionError("No tienes permiso para pasar lista.");

    const parsed = asistenciaSchema.safeParse(values);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos de la asistencia.");
    }

    const subclubId = parsed.data.subclubId ?? null;
    if (subclubId !== null) {
      const subclub = await getSubclubById(subclubId);
      if (!subclub || subclub.id_club !== parsed.data.clubId) return actionError("El subclub no pertenece a este club.");
      await requirePermisoEnSubclub("asistencia:pasar", subclubId, subclub.id_club);
    } else {
      await requirePermisoComoEncargadoGeneral("asistencia:pasar", parsed.data.clubId);
    }

    const configuracion = await getConfiguracion();
    const ventana = calcularVentanaAsistencia(configuracion);
    if (!ventana.abierta) {
      return actionError("Fuera del horario de pastoral: solo puedes pasar lista durante las 24 horas después del horario configurado.");
    }

    // Lista de un subclub: solo sus miembros. Lista general: cualquier miembro
    // del club (cada registro conserva el subclub del estudiante para el historial).
    const miembros = (await getEstudiantesPorClub(parsed.data.clubId)).filter(
      (m) => subclubId === null || m.id_subclub === subclubId,
    );
    const idsValidos = new Set(miembros.map((m) => m.id_estudiante));
    const subclubPorEstudiante = new Map(miembros.map((m) => [m.id_estudiante, m.id_subclub ?? null]));

    const registros = parsed.data.registros
      .filter((r) => idsValidos.has(r.estudianteId))
      .map((r) => ({
        id_estudiante: r.estudianteId,
        id_club: parsed.data.clubId,
        id_subclub: subclubPorEstudiante.get(r.estudianteId) ?? null,
        fecha: parsed.data.fecha,
        estado: r.presente ? ("Presente" as const) : r.justificacion ? ("Justificado" as const) : ("Ausente" as const),
        nota: r.justificacion ?? null,
        id_usuario: Number(session.user.id),
      }));

    await guardarAsistencia(registros);

    const presentes = registros.filter((r) => r.estado === "Presente").length;
    await registrarBitacora({
      session,
      accion: "asistencia.pasar",
      entidad: "asistencia",
      entidadId: `${parsed.data.clubId}${subclubId !== null ? `_s${subclubId}` : ""}_${parsed.data.fecha}`,
      descripcion: `Pasó lista del club #${parsed.data.clubId}${subclubId !== null ? ` (subclub #${subclubId})` : ""} para el ${parsed.data.fecha}: ${presentes}/${registros.length} presentes.`,
      metadata: { clubId: parsed.data.clubId, subclubId, fecha: parsed.data.fecha, presentes, total: registros.length },
    });

    revalidatePath("/club/asistencia");
    revalidatePath("/club/historial");
    revalidateTag(CACHE_TAGS.asistencia);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo guardar la asistencia. Inténtalo de nuevo.");
  }
}
