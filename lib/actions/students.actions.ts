"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { parsearRosterExcel, type ResultadoParseoExcel } from "@/lib/excel";
import { rosterUploadSchema, type FilaExcel } from "@/lib/validations/roster.schema";
import { replaceEstudiantes } from "@/lib/db/estudiantes";
import { getClubes, saveClubes, backupClubes } from "@/lib/db/clubes";
import { appendHistorial } from "@/lib/db/historial";
import { saveMeta } from "@/lib/db/meta";
import { generarId } from "@/lib/utils";
import type { Estudiante, HistorialClub } from "@/types";
import { actionOk, actionError, type ActionResult } from "./types";

async function requirePastoral() {
  const session = await auth();
  if (!session || session.user.rol !== "pastoral") {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  return session;
}

export async function previewRoster(formData: FormData): Promise<ActionResult<ResultadoParseoExcel>> {
  try {
    await requirePastoral();
    const archivo = formData.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) {
      return actionError("Selecciona un archivo Excel (.xlsx) para continuar.");
    }
    const buffer = await archivo.arrayBuffer();
    const resultado = parsearRosterExcel(buffer);
    if (resultado.validas.length === 0) {
      return actionError("No se encontró ninguna fila válida en el archivo. Verifica el formato (columnas Nombre, Apellido, Curso, Matrícula).");
    }
    return actionOk(resultado);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo leer el archivo.");
  }
}

export async function confirmRosterUpload(
  filas: FilaExcel[],
  anioEscolarInput: string,
): Promise<ActionResult<{ totalEstudiantes: number; archivados: number }>> {
  try {
    await requirePastoral();

    const parsedAnio = rosterUploadSchema.safeParse({ anioEscolar: anioEscolarInput });
    if (!parsedAnio.success) {
      return actionError(parsedAnio.error.issues[0]?.message ?? "Indica un año escolar válido.");
    }
    if (filas.length === 0) {
      return actionError("No hay filas para cargar.");
    }
    const anioEscolar = parsedAnio.data.anioEscolar;

    const clubesActuales = await getClubes();

    await backupClubes();

    const hoy = new Date().toISOString().slice(0, 10);
    const entradasHistorial: HistorialClub[] = [];
    for (const club of clubesActuales) {
      for (const estudianteId of club.miembrosActuales) {
        entradasHistorial.push({
          id: generarId("hist"),
          estudianteId,
          clubId: club.id,
          clubNombre: club.nombre,
          anioEscolar: club.cicloActual.anioEscolar,
          cicloNumero: club.cicloActual.numero,
          fechaInicio: club.cicloActual.fechaInicio,
          fechaFin: hoy,
          motivoArchivo: "nuevo_anio_escolar",
        });
      }
    }
    await appendHistorial(entradasHistorial);

    const clubesVacios = clubesActuales.map((c) => ({
      ...c,
      miembrosActuales: [],
      cicloActual: { numero: 1, fechaInicio: hoy, anioEscolar },
    }));
    await saveClubes(clubesVacios);

    const nuevosEstudiantes: Estudiante[] = filas.map((f) => ({
      id: f.matricula,
      nombre: f.nombre,
      apellido: f.apellido,
      curso: f.curso,
      matricula: f.matricula,
      anioEscolar,
    }));
    await replaceEstudiantes(nuevosEstudiantes);

    await saveMeta({
      anioActual: anioEscolar,
      fechaUltimaCargaRoster: new Date().toISOString(),
      totalEstudiantes: nuevosEstudiantes.length,
    });

    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin/clubes");
    revalidatePath("/admin");
    return actionOk({ totalEstudiantes: nuevosEstudiantes.length, archivados: entradasHistorial.length });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo cargar el listado.");
  }
}
