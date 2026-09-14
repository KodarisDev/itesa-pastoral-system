import path from "path";
import ExcelJS from "exceljs";
import type { SesionEnriquecida } from "./asistencia";

const TEMPLATE_PATH = path.join(process.cwd(), "public", "plantillas", "Plantilla_Asistencia_Pastoral.xlsx");

async function cargarPlantilla(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  return workbook;
}

function copiarPlantilla(origen: ExcelJS.Worksheet, destino: ExcelJS.Worksheet) {
  origen.columns.forEach((col, index) => {
    destino.getColumn(index + 1).width = col.width;
  });
  origen.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    destino.getRow(rowNumber).height = row.height;
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      const nuevaCelda = destino.getCell(rowNumber, columnNumber);
      nuevaCelda.value = cell.value;
      nuevaCelda.style = { ...cell.style };
    });
  });
  origen.model.merges?.forEach((merge) => destino.mergeCells(merge));
}

function prepararHoja(ws: ExcelJS.Worksheet, clubNombre: string, fecha: string) {
  ws.getCell("B4").value = clubNombre;
  ws.getCell("B5").value = new Date(`${fecha}T00:00:00`);
  ws.getCell("B5").numFmt = "dd/mm/yyyy";
  ws.views = [{ state: "frozen", ySplit: 7 }];
  ws.autoFilter = { from: "A7", to: "F7" };
}

function nombreHoja(nombre: string, usados: Set<string>): string {
  let base = nombre.replace(/[*?:/\\[\]]/g, "").trim().slice(0, 31) || "Club";
  let candidato = base;
  let i = 2;
  while (usados.has(candidato.toLowerCase())) {
    candidato = `${base.slice(0, 27)} (${i})`;
    i += 1;
  }
  usados.add(candidato.toLowerCase());
  return candidato;
}

export interface GenerarExcelOpciones {
  subtitulo: string;
  clubes: string[];
}

export async function generarExcelAsistencia(
  sesiones: SesionEnriquecida[],
  { subtitulo, clubes }: GenerarExcelOpciones,
): Promise<Buffer> {
  const plantilla = await cargarPlantilla();
  const hojaPlantilla = plantilla.worksheets[0];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ITESA Pastoral";
  workbook.created = new Date();

  const porClub = new Map<string, SesionEnriquecida[]>();
  for (const s of sesiones) {
    const arr = porClub.get(s.clubNombre) ?? [];
    arr.push(s);
    porClub.set(s.clubNombre, arr);
  }
  const clubesOrdenados = Array.from(new Set([...clubes, ...porClub.keys()])).sort();
  const nombresUsados = new Set<string>();
  for (const clubNombre of clubesOrdenados) {
    const sesionesClub = porClub.get(clubNombre) ?? [];
    const fecha = sesionesClub[0]?.fecha ?? subtitulo.match(/Fecha: (\d{4}-\d{2}-\d{2})/)?.[1] ?? new Date().toISOString().slice(0, 10);
    const ws = workbook.addWorksheet(nombreHoja(clubNombre, nombresUsados));
    copiarPlantilla(hojaPlantilla, ws);
    prepararHoja(ws, clubNombre, fecha);

    let fila = 8;
    const filasOrdenadas = [...sesionesClub].sort((a, b) => a.fecha.localeCompare(b.fecha));
    for (const sesion of filasOrdenadas) {
      const registrosOrdenados = [...sesion.registros].sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
      for (const registro of registrosOrdenados) {
        const row = ws.getRow(fila);
        row.getCell(1).value = registro.nombre;
        row.getCell(2).value = registro.apellido;
        row.getCell(3).value = registro.curso;
        row.getCell(4).value = registro.matricula;
        row.getCell(5).value = registro.presente ? "Presente" : "Ausente";
        row.getCell(6).value = sesion.tomadaPorNombre;
        fila += 1;
      }
    }
  }

  if (workbook.worksheets.length === 0) {
    const ws = workbook.addWorksheet("Asistencia");
    copiarPlantilla(hojaPlantilla, ws);
    prepararHoja(ws, clubes[0] ?? "Todos los clubes", subtitulo.match(/Fecha: (\d{4}-\d{2}-\d{2})/)?.[1] ?? new Date().toISOString().slice(0, 10));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
