import * as XLSX from "xlsx";
import { filaExcelSchema, type FilaExcel } from "@/lib/validations/roster.schema";

export interface FilaExcelInvalida {
  fila: number;
  datos: Record<string, unknown>;
  error: string;
}

export interface ResultadoParseoExcel {
  validas: FilaExcel[];
  invalidas: FilaExcelInvalida[];
  duplicadas: string[]; // matrículas repetidas dentro del mismo archivo
}

// Encabezados aceptados por columna (sin acentos, en minúscula) — el formato exacto
// del Excel se confirmará más adelante; mientras tanto se aceptan variantes comunes.
const MAPA_ENCABEZADOS: Record<keyof FilaExcel, string[]> = {
  nombre: ["nombre", "nombres"],
  apellido: ["apellido", "apellidos"],
  curso: ["curso", "grado", "seccion", "sección"],
  matricula: ["matricula", "matrícula", "id", "codigo", "código"],
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function construirMapaColumnas(encabezados: string[]) {
  const normalizados = encabezados.map(normalizar);
  const mapa: Partial<Record<keyof FilaExcel, number>> = {};

  (Object.keys(MAPA_ENCABEZADOS) as (keyof FilaExcel)[]).forEach((campo) => {
    const variantes = MAPA_ENCABEZADOS[campo];
    const idx = normalizados.findIndex((h) => variantes.includes(h));
    if (idx >= 0) mapa[campo] = idx;
  });

  return mapa;
}

export function parsearRosterExcel(buffer: ArrayBuffer): ResultadoParseoExcel {
  const workbook = XLSX.read(buffer, { type: "array" });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const filas: unknown[][] = XLSX.utils.sheet_to_json(hoja, { header: 1, blankrows: false });

  if (filas.length === 0) {
    return { validas: [], invalidas: [], duplicadas: [] };
  }

  const encabezados = (filas[0] as unknown[]).map((c) => String(c ?? ""));
  const mapaColumnas = construirMapaColumnas(encabezados);
  const camposFaltantes = (Object.keys(MAPA_ENCABEZADOS) as (keyof FilaExcel)[]).filter(
    (campo) => mapaColumnas[campo] === undefined,
  );

  if (camposFaltantes.length > 0) {
    throw new Error(
      `El archivo no tiene las columnas esperadas: ${camposFaltantes.join(", ")}. Se esperan columnas Nombre, Apellido, Curso y Matrícula.`,
    );
  }

  const validas: FilaExcel[] = [];
  const invalidas: FilaExcelInvalida[] = [];
  const vistas = new Set<string>();
  const duplicadas = new Set<string>();

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i] as unknown[];
    if (!fila || fila.every((c) => c === undefined || c === null || String(c).trim() === "")) {
      continue;
    }

    const datos = {
      nombre: String(fila[mapaColumnas.nombre!] ?? "").trim(),
      apellido: String(fila[mapaColumnas.apellido!] ?? "").trim(),
      curso: String(fila[mapaColumnas.curso!] ?? "").trim(),
      matricula: String(fila[mapaColumnas.matricula!] ?? "").trim(),
    };

    const parsed = filaExcelSchema.safeParse(datos);
    if (!parsed.success) {
      invalidas.push({
        fila: i + 1,
        datos,
        error: parsed.error.issues.map((it) => it.message).join(", "),
      });
      continue;
    }

    if (vistas.has(parsed.data.matricula)) {
      // Matrícula repetida dentro del mismo archivo: se conserva solo la primera
      // aparición para no crear dos estudiantes con el mismo id.
      duplicadas.add(parsed.data.matricula);
      continue;
    }
    vistas.add(parsed.data.matricula);
    validas.push(parsed.data);
  }

  return { validas, invalidas, duplicadas: Array.from(duplicadas) };
}
