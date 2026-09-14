import { NextRequest, NextResponse } from "next/server";
import { parsearRosterCompleto } from "@/lib/excel";
import { upsertEstudiantePorMatricula } from "@/lib/db/estudiantes";
import { requirePermiso } from "@/lib/auth/guards";

/**
 * Carga inicial (dev) de TODOS los estudiantes: las 21 hojas 4A..6G del
 * Excel maestro del instituto. Pensado para dispararse una sola vez (por
 * ejemplo desde Postman) al preparar un entorno nuevo — no es un flujo de
 * uso normal del panel, por eso no tiene UI.
 *
 * POST multipart/form-data con un campo "archivo" (.xlsx). Requiere sesión
 * de un usuario con permiso "estudiantes:promover" (envía la cookie de
 * sesión en la request de Postman).
 */
export async function POST(req: NextRequest) {
  try {
    await requirePermiso("estudiantes:promover");

    const formData = await req.formData();
    const archivo = formData.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) {
      return NextResponse.json({ error: "Sube un archivo Excel (.xlsx) en el campo 'archivo'." }, { status: 400 });
    }
    if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json({ error: "Solo se permiten archivos .xlsx." }, { status: 400 });
    }

    const buffer = await archivo.arrayBuffer();
    const resultado = parsearRosterCompleto(buffer);
    if (resultado.errores.length > 0) {
      return NextResponse.json(
        { mensaje: "El archivo Excel no es válido. No se modificó la base de datos.", errores: resultado.errores },
        { status: 400 },
      );
    }

    const insertados = await Promise.all(resultado.filas.map((fila) => upsertEstudiantePorMatricula(fila)));

    return NextResponse.json(
      {
        mensaje: "Carga completada para los 21 cursos, sin eliminar estudiantes existentes.",
        procesados: insertados.length,
        duplicadas: resultado.duplicadas,
      },
      { status: 201 },
    );
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error al procesar el Excel.";
    const status = mensaje === "No tienes permiso para realizar esta acción." ? 403 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
