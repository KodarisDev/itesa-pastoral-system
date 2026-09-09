import { promises as fs } from "fs";
import path from "path";
import ExcelJS from "exceljs";
import type { SesionEnriquecida } from "./asistencia";

const BRAND = "FFC0392B";
const BRAND_DARK = "FF7F0000";
const GRAY_HEADER_TEXT = "FF6B7280";
const ZEBRA = "FFF7F3F2";
const PRESENTE_BG = "FFDCFCE7";
const PRESENTE_TEXT = "FF15803D";
const AUSENTE_BG = "FFFEE2E2";
const AUSENTE_TEXT = "FFB91C1C";

const DETAIL_COLUMNS = [
  { header: "Fecha", key: "fecha", width: 14 },
  { header: "Ciclo", key: "ciclo", width: 9 },
  { header: "Año escolar", key: "anio", width: 12 },
  { header: "Estudiante", key: "estudiante", width: 30 },
  { header: "Curso", key: "curso", width: 12 },
  { header: "Matrícula", key: "matricula", width: 14 },
  { header: "Estado", key: "estado", width: 12 },
  { header: "Tomada por", key: "tomadaPor", width: 22 },
];

function sanitizeSheetName(nombre: string, usados: Set<string>): string {
  let base = nombre.replace(/[*?:/\\[\]]/g, "").trim().slice(0, 28) || "Club";
  let candidato = base;
  let i = 2;
  while (usados.has(candidato.toLowerCase())) {
    candidato = `${base} (${i})`.slice(0, 31);
    i += 1;
  }
  usados.add(candidato.toLowerCase());
  return candidato;
}

async function cargarLogo(workbook: ExcelJS.Workbook) {
  try {
    const buffer = await fs.readFile(path.join(process.cwd(), "public", "branding", "logo-report.png"));
    // exceljs declara `buffer?: Buffer` contra una versión de @types/node distinta a la
    // del proyecto; el valor es un Buffer válido en runtime, solo difiere el tipo declarado.
    return workbook.addImage({ buffer, extension: "png" } as unknown as ExcelJS.Image);
  } catch {
    return null;
  }
}

function pintarEncabezado(
  ws: ExcelJS.Worksheet,
  logoId: number | null,
  columnas: number,
  titulo: string,
  subtitulo: string,
) {
  const ultimaCol = ws.getColumn(columnas).letter;
  ws.mergeCells(`C1:${ultimaCol}1`);
  ws.mergeCells(`C2:${ultimaCol}2`);
  ws.mergeCells(`C3:${ultimaCol}3`);

  ws.getCell("C1").value = titulo;
  ws.getCell("C1").font = { bold: true, size: 15, color: { argb: BRAND_DARK } };
  ws.getCell("C2").value = subtitulo;
  ws.getCell("C2").font = { size: 10, color: { argb: GRAY_HEADER_TEXT } };
  ws.getCell("C3").value = `Generado el ${new Date().toLocaleString("es-DO", { dateStyle: "long", timeStyle: "short" })}`;
  ws.getCell("C3").font = { size: 9, italic: true, color: { argb: GRAY_HEADER_TEXT } };

  ws.getRow(1).height = 26;
  ws.getRow(2).height = 16;
  ws.getRow(3).height = 15;
  ws.getRow(4).height = 8;

  if (logoId !== null) {
    ws.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 132, height: 53 } });
  }
}

function pintarFilaEncabezadoTabla(ws: ExcelJS.Worksheet, fila: number, columnas: { header: string }[]) {
  const row = ws.getRow(fila);
  columnas.forEach((c, i) => {
    const cell = row.getCell(i + 1);
    cell.value = c.header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    cell.alignment = { vertical: "middle" };
    cell.border = { bottom: { style: "thin", color: { argb: BRAND_DARK } } };
  });
  row.height = 20;
}

export interface GenerarExcelOpciones {
  subtitulo: string;
}

export async function generarExcelAsistencia(
  sesiones: SesionEnriquecida[],
  { subtitulo }: GenerarExcelOpciones,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ITESA Pastoral";
  workbook.created = new Date();

  const logoId = await cargarLogo(workbook);
  const porClub = new Map<string, SesionEnriquecida[]>();
  for (const s of sesiones) {
    const arr = porClub.get(s.clubNombre) ?? [];
    arr.push(s);
    porClub.set(s.clubNombre, arr);
  }
  const clubesOrdenados = Array.from(porClub.keys()).sort();

  if (clubesOrdenados.length > 1) {
    const resumen = workbook.addWorksheet("Resumen");
    pintarEncabezado(resumen, logoId, 5, "Resumen de asistencia — Área de Pastoral", subtitulo);

    const columnasResumen = [
      { header: "Club", width: 30 },
      { header: "Sesiones registradas", width: 20 },
      { header: "Total presentes", width: 16 },
      { header: "Total registros", width: 16 },
      { header: "% Asistencia", width: 14 },
    ];
    columnasResumen.forEach((c, i) => (resumen.getColumn(i + 1).width = c.width));
    pintarFilaEncabezadoTabla(resumen, 5, columnasResumen);

    let filaResumen = 6;
    let totalSesiones = 0;
    let totalPresentes = 0;
    let totalRegistros = 0;
    for (const clubNombre of clubesOrdenados) {
      const sesionesClub = porClub.get(clubNombre)!;
      const presentes = sesionesClub.reduce((acc, s) => acc + s.presentes, 0);
      const total = sesionesClub.reduce((acc, s) => acc + s.total, 0);
      totalSesiones += sesionesClub.length;
      totalPresentes += presentes;
      totalRegistros += total;

      const row = resumen.getRow(filaResumen);
      row.getCell(1).value = clubNombre;
      row.getCell(2).value = sesionesClub.length;
      row.getCell(3).value = presentes;
      row.getCell(4).value = total;
      row.getCell(5).value = total > 0 ? `${Math.round((presentes / total) * 100)}%` : "—";
      if (filaResumen % 2 === 0) {
        row.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } }));
      }
      filaResumen += 1;
    }

    const rowTotal = resumen.getRow(filaResumen);
    rowTotal.getCell(1).value = "Total general";
    rowTotal.getCell(1).font = { bold: true };
    rowTotal.getCell(2).value = totalSesiones;
    rowTotal.getCell(2).font = { bold: true };
    rowTotal.getCell(3).value = totalPresentes;
    rowTotal.getCell(3).font = { bold: true };
    rowTotal.getCell(4).value = totalRegistros;
    rowTotal.getCell(4).font = { bold: true };
    rowTotal.getCell(5).value = totalRegistros > 0 ? `${Math.round((totalPresentes / totalRegistros) * 100)}%` : "—";
    rowTotal.getCell(5).font = { bold: true };
    rowTotal.eachCell((cell) => {
      cell.border = { top: { style: "thin", color: { argb: BRAND } } };
    });

    resumen.autoFilter = { from: "A5", to: "E5" };
    resumen.views = [{ state: "frozen", ySplit: 5 }];
  }

  const nombresUsados = new Set<string>();
  for (const clubNombre of clubesOrdenados) {
    const sesionesClub = porClub.get(clubNombre)!;
    const ws = workbook.addWorksheet(sanitizeSheetName(clubNombre, nombresUsados));
    DETAIL_COLUMNS.forEach((c, i) => (ws.getColumn(i + 1).width = c.width));
    pintarEncabezado(ws, logoId, DETAIL_COLUMNS.length, clubNombre, subtitulo);
    pintarFilaEncabezadoTabla(ws, 5, DETAIL_COLUMNS);

    let fila = 6;
    const filasOrdenadas = [...sesionesClub].sort((a, b) => b.fecha.localeCompare(a.fecha));
    for (const sesion of filasOrdenadas) {
      const registrosOrdenados = [...sesion.registros].sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
      for (const registro of registrosOrdenados) {
        const row = ws.getRow(fila);
        row.getCell(1).value = new Date(`${sesion.fecha}T00:00:00`);
        row.getCell(1).numFmt = "dd/mm/yyyy";
        row.getCell(2).value = sesion.cicloNumero ?? "—";
        row.getCell(3).value = sesion.anioEscolar;
        row.getCell(4).value = registro.nombreCompleto;
        row.getCell(5).value = registro.curso;
        row.getCell(6).value = registro.matricula;
        row.getCell(7).value = registro.presente ? "Presente" : "Ausente";
        row.getCell(7).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: registro.presente ? PRESENTE_BG : AUSENTE_BG },
        };
        row.getCell(7).font = { color: { argb: registro.presente ? PRESENTE_TEXT : AUSENTE_TEXT }, bold: true };
        row.getCell(7).alignment = { horizontal: "center" };
        row.getCell(8).value = sesion.tomadaPorNombre;

        if (fila % 2 === 0) {
          for (let col = 1; col <= DETAIL_COLUMNS.length; col += 1) {
            if (col === 7) continue;
            row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } };
          }
        }
        fila += 1;
      }
    }

    const ultimaCol = ws.getColumn(DETAIL_COLUMNS.length).letter;
    ws.autoFilter = { from: "A5", to: `${ultimaCol}5` };
    ws.views = [{ state: "frozen", ySplit: 5 }];
  }

  if (workbook.worksheets.length === 0) {
    workbook.addWorksheet("Asistencia");
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
