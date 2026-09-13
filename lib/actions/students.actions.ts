"use server";

import { revalidatePath } from "next/cache";
import { parsearRosterExcel, type ResultadoParseoExcel } from "@/lib/excel";
import type { FilaExcel } from "@/lib/validations/roster.schema";
import { crearEstudiantes } from "@/lib/db/estudiantes";
import { requirePermiso } from "@/lib/auth/guards";
import type { Curso } from "@/types";
import { actionOk, actionError, type ActionResult } from "./types";

const CURSOS_VALIDOS: Curso[] = ["4to", "5to", "6to"];

export async function previewRoster(formData: FormData): Promise<ActionResult<ResultadoParseoExcel>> {
  try {
    await requirePermiso("estudiantes:promover");
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

/**
 * Da de alta las filas del Excel como estudiantes nuevos (activo=true, sin
 * club). No toca clubes ni membresías existentes — eso solo ocurre en la
 * promoción de curso anual.
 */
export async function confirmRosterUpload(
  filas: FilaExcel[],
): Promise<ActionResult<{ totalEstudiantes: number }>> {
  try {
    await requirePermiso("estudiantes:promover");

    if (filas.length === 0) {
      return actionError("No hay filas para cargar.");
    }

    const nuevos = filas.map((f) => ({
      nombre: f.nombre,
      apellido: f.apellido,
      matricula: f.matricula,
      curso: (CURSOS_VALIDOS.includes(f.curso as Curso) ? (f.curso as Curso) : null),
      id_club: null,
      activo: true,
    }));
    const insertados = await crearEstudiantes(nuevos);

    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin");
    return actionOk({ totalEstudiantes: insertados.length });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo cargar el listado.");
  }
}
