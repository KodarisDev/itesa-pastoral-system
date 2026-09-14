import * as XLSX from "xlsx";
import { CURSOS, CURSOS_CUARTO, type Curso } from "@/types";

export interface FilaRoster {
  numero: number;
  apellido: string;
  nombre: string;
  matricula: string;
  curso: Curso;
}

export interface ResultadoParseoRoster {
  filas: FilaRoster[];
  errores: string[];
  /** Matrículas repetidas dentro del archivo: se conserva solo la primera aparición, esto no bloquea la carga. */
  duplicadas: string[];
}

type Campo = "numero" | "apellido" | "nombre" | "matricula";

// El instituto no usa siempre el mismo orden de columnas NI la misma fila de
// encabezado de un año a otro (confirmado con 3 listados reales: unos traen
// el encabezado en la fila 6, otros en la 5 o la 7 dependiendo de cuántas
// filas de "PROFESOR:"/"MATERIA:" haya antes; el orden de columnas también
// cambió de NO./APELLIDOS/NOMBRES/matrícula a MATRICULA/NO./APELLIDOS/NOMBRES).
// Por eso cada hoja se procesa buscando su propia fila de encabezado y
// mapeando columnas por el texto real, en vez de asumir una posición fija.
const VARIANTES_ENCABEZADO: Record<Exclude<Campo, "matricula">, string[]> = {
  numero: ["NO", "NUMERO", "NÚMERO"],
  apellido: ["APELLIDOS", "APELLIDO"],
  nombre: ["NOMBRES", "NOMBRE"],
};
const VARIANTES_MATRICULA = ["MATRICULA", "MATRÍCULA"];

const MAX_FILAS_BUSCAR_ENCABEZADO = 15;
const MAX_COLUMNAS_ENCABEZADO = 6;

function normalizarEncabezado(texto: unknown): string {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\.$/, "");
}

interface EncabezadoEncontrado {
  fila: number;
  columnas: Record<Campo, number>;
}

/** Busca en las primeras filas de la hoja cuál es la fila de encabezado y en qué columna está cada campo. */
function buscarEncabezado(workbook: XLSX.WorkBook, sheetName: string): EncabezadoEncontrado | null {
  const ws = workbook.Sheets[sheetName];
  if (!ws) return null;

  for (let r = 0; r < MAX_FILAS_BUSCAR_ENCABEZADO; r++) {
    const encabezados: string[] = [];
    for (let c = 0; c < MAX_COLUMNAS_ENCABEZADO; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      encabezados.push(normalizarEncabezado(ws[addr]?.v));
    }

    const mapa: Partial<Record<Campo, number>> = {};
    for (const campo of Object.keys(VARIANTES_ENCABEZADO) as Exclude<Campo, "matricula">[]) {
      const idx = encabezados.findIndex((h) => VARIANTES_ENCABEZADO[campo].includes(h));
      if (idx >= 0) mapa[campo] = idx;
    }

    const tresCompletos = mapa.numero !== undefined && mapa.apellido !== undefined && mapa.nombre !== undefined;
    if (!tresCompletos) continue;

    const idxMatricula = encabezados.findIndex((h) => VARIANTES_MATRICULA.includes(h));
    if (idxMatricula >= 0) {
      mapa.matricula = idxMatricula;
    } else {
      // Sin encabezado propio: se asume la primera columna libre entre las 4 iniciales.
      const usadas = new Set([mapa.numero, mapa.apellido, mapa.nombre]);
      const libre = [0, 1, 2, 3].find((c) => !usadas.has(c));
      if (libre === undefined) continue;
      mapa.matricula = libre;
    }

    return { fila: r, columnas: mapa as Record<Campo, number> };
  }

  return null;
}

/** Lee una hoja desde `filaInicio` hacia abajo hasta la primera fila completamente vacía (en las columnas relevantes). */
function extractRangeDown(workbook: XLSX.WorkBook, sheetName: string, filaInicio: number, columnas: number[]): unknown[][] {
  const ws = workbook.Sheets[sheetName];
  if (!ws) throw new Error(`La hoja "${sheetName}" no existe`);

  const result: unknown[][] = [];

  for (let r = filaInicio; ; r++) {
    let emptyRow = true;
    const rowValues: unknown[] = [];

    for (const c of columnas) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      const value = cell ? cell.v : null;
      rowValues[c] = value;
      if (value !== null && value !== undefined && value !== "") emptyRow = false;
    }

    if (emptyRow) break;
    result.push(rowValues);
  }

  return result;
}

/**
 * Valida y extrae las filas de un workbook para la lista de cursos dada —
 * cada curso es el nombre EXACTO de una hoja del Excel (así se identifica el
 * curso: por el nombre de la pestaña, no por texto dentro de la hoja). Hojas
 * que no estén en `cursos` se ignoran por completo (p. ej. las hojas de
 * calificaciones "6A-G" o pestañas sueltas como "Hoja1").
 */
function parsearWorkbookPorCursos(workbook: XLSX.WorkBook, cursos: Curso[]): ResultadoParseoRoster {
  const filas: FilaRoster[] = [];
  const errores: string[] = [];

  for (const curso of cursos) {
    if (!workbook.Sheets[curso]) {
      errores.push(`Falta la hoja "${curso}" en el archivo Excel.`);
    }
  }

  for (const curso of cursos) {
    if (!workbook.Sheets[curso]) continue;

    try {
      const encabezado = buscarEncabezado(workbook, curso);
      if (!encabezado) {
        errores.push(`[${curso}] No se pudo identificar la fila de encabezado (NO./APELLIDOS/NOMBRES/MATRÍCULA).`);
        continue;
      }
      const { columnas } = encabezado;
      const filaInicioDatos = encabezado.fila + 1;

      const filasHoja = extractRangeDown(workbook, curso, filaInicioDatos, Object.values(columnas));

      if (filasHoja.length === 0) {
        errores.push(`La hoja "${curso}" no tiene registros después de su encabezado (fila ${filaInicioDatos + 1}).`);
        continue;
      }

      filasHoja.forEach((row, index) => {
        const numero = row[columnas.numero];
        const apellidos = row[columnas.apellido];
        const nombres = row[columnas.nombre];
        const matricula = row[columnas.matricula];
        const excelRowNumber = filaInicioDatos + index + 1;
        const esperado = index + 1;

        if (numero === null || numero === undefined || numero === "") {
          errores.push(`[${curso}] Fila ${excelRowNumber}: número vacío, se esperaba ${esperado}.`);
        } else if (Number(numero) !== esperado) {
          errores.push(`[${curso}] Fila ${excelRowNumber}: se esperaba el número ${esperado} y tiene "${numero}".`);
        }
        if (apellidos === null || apellidos === undefined || String(apellidos).trim() === "") {
          errores.push(`[${curso}] Fila ${excelRowNumber}: apellidos vacíos.`);
        }
        if (nombres === null || nombres === undefined || String(nombres).trim() === "") {
          errores.push(`[${curso}] Fila ${excelRowNumber}: nombres vacíos.`);
        }
        if (matricula === null || matricula === undefined || String(matricula).trim() === "") {
          errores.push(`[${curso}] Fila ${excelRowNumber}: matrícula vacía.`);
        }

        filas.push({
          numero: Number(numero),
          apellido: String(apellidos ?? "").trim(),
          nombre: String(nombres ?? "").trim(),
          matricula: String(matricula ?? "").trim(),
          curso,
        });
      });
    } catch (err) {
      errores.push(`Error leyendo la hoja "${curso}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Matrículas duplicadas dentro del mismo archivo (entre cursos o dentro del mismo):
  // se conserva solo la primera aparición — no bloquea la carga, pero se reporta para
  // que el instituto revise su listado (dos estudiantes distintos no deberían compartir matrícula).
  const vistas = new Set<string>();
  const duplicadas = new Set<string>();
  const filasSinDuplicados: FilaRoster[] = [];
  for (const fila of filas) {
    if (vistas.has(fila.matricula)) {
      duplicadas.add(fila.matricula);
      continue;
    }
    vistas.add(fila.matricula);
    filasSinDuplicados.push(fila);
  }

  return { filas: errores.length > 0 ? [] : filasSinDuplicados, errores, duplicadas: Array.from(duplicadas) };
}

/** Formato del listado anual de 4to (7 hojas: 4A..4G). */
export function parsearRosterCuarto(buffer: ArrayBuffer): ResultadoParseoRoster {
  const workbook = XLSX.read(buffer, { type: "array" });
  return parsearWorkbookPorCursos(workbook, CURSOS_CUARTO);
}

/** Formato de carga completa (dev): las 21 hojas 4A..6G. Otras hojas del archivo se ignoran. */
export function parsearRosterCompleto(buffer: ArrayBuffer): ResultadoParseoRoster {
  const workbook = XLSX.read(buffer, { type: "array" });
  return parsearWorkbookPorCursos(workbook, [...CURSOS]);
}
