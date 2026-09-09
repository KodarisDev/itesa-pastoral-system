"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { solicitudSchema, type SolicitudFormValues } from "@/lib/validations/solicitud.schema";
import { getClubes, saveClubes, getClubById } from "@/lib/db/clubes";
import { getEstudiantes } from "@/lib/db/estudiantes";
import {
  addSolicitud,
  getSolicitudById,
  getSolicitudes,
  saveSolicitud,
  saveSolicitudes,
} from "@/lib/db/solicitudes";
import { generarId } from "@/lib/utils";
import type { Club, SolicitudInscripcion, TipoResolucion } from "@/types";
import { actionOk, actionError, type ActionResult } from "./types";

async function requirePastoral() {
  const session = await auth();
  if (!session || session.user.rol !== "pastoral") {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  return session;
}

function cupoDisponible(club: Club) {
  return club.capacidadMaxima - club.miembrosActuales.length;
}

export async function createSolicitud(values: SolicitudFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = solicitudSchema.safeParse(values);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const [clubes, estudiantes] = await Promise.all([getClubes(), getEstudiantes()]);
    const clubDeseado = clubes.find((c) => c.id === parsed.data.clubDeseadoId);
    const clubAlternativo = clubes.find((c) => c.id === parsed.data.clubAlternativoId);
    if (!clubDeseado || !clubAlternativo) {
      return actionError("Uno de los clubes seleccionados ya no está disponible. Recarga la página e inténtalo de nuevo.");
    }

    const estudiante = estudiantes.find((e) => e.matricula === parsed.data.matricula.trim());

    const solicitud: SolicitudInscripcion = {
      id: generarId("sol"),
      fecha: new Date().toISOString(),
      nombre: parsed.data.nombre,
      apellido: parsed.data.apellido,
      curso: parsed.data.curso,
      matricula: parsed.data.matricula,
      estudianteId: estudiante?.id,
      clubDeseadoId: parsed.data.clubDeseadoId,
      clubAlternativoId: parsed.data.clubAlternativoId,
      estado: "pendiente",
    };

    await addSolicitud(solicitud);
    revalidatePath("/admin/solicitudes");
    return actionOk({ id: solicitud.id });
  } catch {
    return actionError("No se pudo enviar tu solicitud. Inténtalo de nuevo en unos minutos.");
  }
}

type AccionResolucion = "principal" | "alternativo" | "manual" | "rechazar";

export async function resolveSolicitud(
  solicitudId: string,
  accion: AccionResolucion,
  opts?: { manualClubId?: string; motivoRechazo?: string },
): Promise<ActionResult> {
  try {
    const session = await requirePastoral();
    const solicitud = await getSolicitudById(solicitudId);
    if (!solicitud) return actionError("La solicitud no existe.");
    if (solicitud.estado !== "pendiente") {
      return actionError("Esta solicitud ya fue resuelta.");
    }

    if (accion === "rechazar") {
      await saveSolicitud({
        ...solicitud,
        estado: "rechazada",
        motivoRechazo: opts?.motivoRechazo?.trim() || "Sin motivo especificado.",
        resolucion: { tipo: "manual", fecha: new Date().toISOString(), porUsuarioId: session.user.id },
      });
      revalidatePath("/admin/solicitudes");
      return actionOk(undefined);
    }

    if (!solicitud.estudianteId) {
      return actionError(
        "La matrícula de esta solicitud no coincide con ningún estudiante del listado vigente. Verifica el dato antes de asignarlo a un club (puedes rechazarla mientras tanto).",
      );
    }

    const clubObjetivoId =
      accion === "principal"
        ? solicitud.clubDeseadoId
        : accion === "alternativo"
          ? solicitud.clubAlternativoId
          : opts?.manualClubId;

    if (!clubObjetivoId) {
      return actionError("Selecciona un club para la asignación manual.");
    }

    const club = await getClubById(clubObjetivoId);
    if (!club) return actionError("El club seleccionado no existe.");
    if (club.miembrosActuales.includes(solicitud.estudianteId)) {
      return actionError("Este estudiante ya es miembro de ese club.");
    }
    if (cupoDisponible(club) <= 0) {
      return actionError(`El club "${club.nombre}" ya no tiene cupo disponible.`);
    }

    const clubes = await getClubes();
    const next = clubes.map((c) =>
      c.id === club.id ? { ...c, miembrosActuales: [...c.miembrosActuales, solicitud.estudianteId!] } : c,
    );
    await saveClubes(next);

    const tipoResolucion: TipoResolucion = accion === "manual" ? "manual" : accion;
    await saveSolicitud({
      ...solicitud,
      estado: "aceptada",
      clubAsignadoId: club.id,
      resolucion: { tipo: tipoResolucion, fecha: new Date().toISOString(), porUsuarioId: session.user.id },
    });

    revalidatePath("/admin/solicitudes");
    revalidatePath("/admin/clubes");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo resolver la solicitud.");
  }
}

export async function sortearPendientes(): Promise<ActionResult<{ asignados: number; sinCupo: number }>> {
  try {
    const session = await requirePastoral();
    const [solicitudes, clubes] = await Promise.all([getSolicitudes(), getClubes()]);

    const pendientes = solicitudes.filter((s) => s.estado === "pendiente" && s.estudianteId);
    // baraja aleatoria (Fisher-Yates)
    const barajadas = [...pendientes];
    for (let i = barajadas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [barajadas[i], barajadas[j]] = [barajadas[j], barajadas[i]];
    }

    const clubesMap = new Map(clubes.map((c) => [c.id, { ...c, miembrosActuales: [...c.miembrosActuales] }]));
    const solicitudesActualizadas: SolicitudInscripcion[] = [];
    let asignados = 0;
    let sinCupo = 0;

    for (const solicitud of barajadas) {
      const disponibles = Array.from(clubesMap.values()).filter(
        (c) => cupoDisponible(c) > 0 && !c.miembrosActuales.includes(solicitud.estudianteId!),
      );
      if (disponibles.length === 0) {
        sinCupo++;
        continue;
      }
      const elegido = disponibles[Math.floor(Math.random() * disponibles.length)];
      elegido.miembrosActuales.push(solicitud.estudianteId!);
      asignados++;
      solicitudesActualizadas.push({
        ...solicitud,
        estado: "aceptada",
        clubAsignadoId: elegido.id,
        resolucion: { tipo: "sorteo", fecha: new Date().toISOString(), porUsuarioId: session.user.id },
      });
    }

    if (asignados > 0) {
      await saveClubes(Array.from(clubesMap.values()));
      await saveSolicitudes(solicitudesActualizadas);
    }

    revalidatePath("/admin/solicitudes");
    revalidatePath("/admin/clubes");
    return actionOk({ asignados, sinCupo });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo ejecutar el sorteo.");
  }
}

export async function asignarAutomaticamente(): Promise<
  ActionResult<{ asignadosPrincipal: number; asignadosAlternativo: number; sinCupo: number }>
> {
  try {
    const session = await requirePastoral();
    const [solicitudes, clubes] = await Promise.all([getSolicitudes(), getClubes()]);

    const pendientes = solicitudes.filter((s) => s.estado === "pendiente" && s.estudianteId);
    const clubesMap = new Map(clubes.map((c) => [c.id, { ...c, miembrosActuales: [...c.miembrosActuales] }]));
    const solicitudesActualizadas: SolicitudInscripcion[] = [];
    let asignadosPrincipal = 0;
    let asignadosAlternativo = 0;
    let sinCupo = 0;

    for (const solicitud of pendientes) {
      const principal = clubesMap.get(solicitud.clubDeseadoId);
      const alternativo = clubesMap.get(solicitud.clubAlternativoId);

      if (principal && cupoDisponible(principal) > 0 && !principal.miembrosActuales.includes(solicitud.estudianteId!)) {
        principal.miembrosActuales.push(solicitud.estudianteId!);
        asignadosPrincipal++;
        solicitudesActualizadas.push({
          ...solicitud,
          estado: "aceptada",
          clubAsignadoId: principal.id,
          resolucion: { tipo: "automatica", fecha: new Date().toISOString(), porUsuarioId: session.user.id },
        });
        continue;
      }

      if (alternativo && cupoDisponible(alternativo) > 0 && !alternativo.miembrosActuales.includes(solicitud.estudianteId!)) {
        alternativo.miembrosActuales.push(solicitud.estudianteId!);
        asignadosAlternativo++;
        solicitudesActualizadas.push({
          ...solicitud,
          estado: "aceptada",
          clubAsignadoId: alternativo.id,
          resolucion: { tipo: "automatica", fecha: new Date().toISOString(), porUsuarioId: session.user.id },
        });
        continue;
      }

      sinCupo++;
    }

    if (solicitudesActualizadas.length > 0) {
      await saveClubes(Array.from(clubesMap.values()));
      await saveSolicitudes(solicitudesActualizadas);
    }

    revalidatePath("/admin/solicitudes");
    revalidatePath("/admin/clubes");
    return actionOk({ asignadosPrincipal, asignadosAlternativo, sinCupo });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo ejecutar la asignación automática.");
  }
}
