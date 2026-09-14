"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { parsearRosterCuarto, type ResultadoParseoRoster } from "@/lib/excel";
import { upsertEstudiantePorMatricula, promoverEstudiantes } from "@/lib/db/estudiantes";
import { CACHE_TAGS } from "@/lib/db/cached";
import { requirePermiso } from "@/lib/auth/guards";
import { actionOk, actionError, type ActionResult } from "./types";

function formatearErrores(errores: string[]): string {
  const primeros = errores.slice(0, 5).join(" | ");
  return errores.length > 5 ? `${primeros} | y ${errores.length - 5} error(es) más.` : primeros;
}

/**
 * Valida el Excel anual de 4to (7 hojas: 4A..4G, formato oficial) sin tocar
 * la base de datos — paso 1 de la promoción de curso.
 */
export async function validarRosterCuarto(formData: FormData): Promise<ActionResult<ResultadoParseoRoster>> {
  try {
    await requirePermiso("estudiantes:promover");

    const archivo = formData.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) {
      return actionError("Selecciona un archivo Excel (.xlsx) para continuar.");
    }
    if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
      return actionError("Solo se permiten archivos .xlsx.");
    }

    const buffer = await archivo.arrayBuffer();
    const resultado = parsearRosterCuarto(buffer);
    if (resultado.errores.length > 0) {
      return actionError(formatearErrores(resultado.errores));
    }

    return actionOk(resultado);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo validar el archivo.");
  }
}

/**
 * Ejecuta la promoción de curso completa, igual que en Itesa-Psychology-System:
 * 1) promueve a todo estudiante activo de 4to/5to/6to que NO esté en
 *    `idsNoPasaron` (sube de grado conservando su sección; 6to → ExAlumno,
 *    inactivo) y desactiva a los que sí están en `idsNoPasaron`.
 * 2) da de alta (o actualiza) a los estudiantes nuevos de 4to del Excel
 *    validado, ocupando el grado que acaba de quedar vacío.
 * El archivo se vuelve a validar aquí (no se confía en la validación previa
 * del cliente) — si no es válido, no se toca la base de datos.
 */
export async function ejecutarPromocion(
  formData: FormData,
): Promise<ActionResult<{ promovidos: number; desactivados: number; procesados: number; duplicadas: string[] }>> {
  try {
    await requirePermiso("estudiantes:promover");

    const archivo = formData.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) {
      return actionError("Selecciona un archivo Excel (.xlsx) para continuar.");
    }

    const idsNoPasaron = formData
      .getAll("idsNoPasaron")
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0);

    const buffer = await archivo.arrayBuffer();
    const resultado = parsearRosterCuarto(buffer);
    if (resultado.errores.length > 0) {
      return actionError(`El archivo Excel no es válido, no se modificó la base de datos. ${formatearErrores(resultado.errores)}`);
    }

    const { promovidos, desactivados } = await promoverEstudiantes(idsNoPasaron);

    const insertados = await Promise.all(resultado.filas.map((fila) => upsertEstudiantePorMatricula(fila)));

    revalidatePath("/admin/estudiantes");
    revalidatePath("/admin/promocion");
    revalidatePath("/admin");
    revalidateTag(CACHE_TAGS.estudiantes);
    return actionOk({ promovidos, desactivados, procesados: insertados.length, duplicadas: resultado.duplicadas });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Ocurrió un error al ejecutar la promoción.");
  }
}
