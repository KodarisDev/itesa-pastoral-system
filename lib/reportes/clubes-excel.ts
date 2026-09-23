import path from "path";
import ExcelJS from "exceljs";
import type { ClubConMiembros } from "./clubes";

const TEMPLATE_PATH = path.join(process.cwd(), "public", "plantillas", "Plantilla_Listado_Clubs.xlsx");

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

function prepararHoja(ws: ExcelJS.Worksheet, clubNombre: string, encargadoNombre: string | null, fechaGeneracion: Date) {
  ws.getCell("B4").value = clubNombre;
  ws.getCell("B5").value = fechaGeneracion;
  ws.getCell("B5").numFmt = "dd/mm/yyyy";

  // La plantilla no trae una fila de "Encargado" — reutilizamos la fila 6
  // (antes en blanco, entre Fecha y el encabezado) clonando el estilo de la
  // fila 5 para que se vea igual.
  ws.getRow(6).height = ws.getRow(5).height;
  ws.getCell("A6").style = { ...ws.getCell("A5").style };
  ws.getCell("A6").value = "Encargado:";
  ws.getCell("B6").style = { ...ws.getCell("B5").style, numFmt: undefined };
  ws.getCell("B6").value = encargadoNombre ?? "Sin encargado";

  ws.views = [{ state: "frozen", ySplit: 7 }];
  ws.autoFilter = { from: "A7", to: "D7" };
}

function nombreHoja(nombre: string, usados: Set<string>): string {
  const base = nombre.replace(/[*?:/\\[\]]/g, "").trim().slice(0, 31) || "Club";
  let candidato = base;
  let i = 2;
  while (usados.has(candidato.toLowerCase())) {
    candidato = `${base.slice(0, 27)} (${i})`;
    i += 1;
  }
  usados.add(candidato.toLowerCase());
  return candidato;
}

function compararPorApellido(a: { apellido: string; nombre: string }, b: { apellido: string; nombre: string }) {
  return a.apellido.localeCompare(b.apellido, "es") || a.nombre.localeCompare(b.nombre, "es");
}

/** Genera el Excel de "Listado Estudiantes Club Pastoral ITESA" a partir de la plantilla — una hoja por club. */
export async function generarExcelEstudiantesClub(grupos: ClubConMiembros[], fechaGeneracion: Date): Promise<Buffer> {
  const plantilla = await cargarPlantilla();
  const hojaPlantilla = plantilla.worksheets[0];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ITESA Pastoral";
  workbook.created = new Date();

  const nombresUsados = new Set<string>();
  for (const { club, encargadoPrincipalNombre, miembros } of grupos) {
    const ws = workbook.addWorksheet(nombreHoja(club.nombre, nombresUsados));
    copiarPlantilla(hojaPlantilla, ws);
    prepararHoja(ws, club.nombre, encargadoPrincipalNombre, fechaGeneracion);

    const ordenados = [...miembros].sort(compararPorApellido);
    let fila = 8;
    for (const e of ordenados) {
      const row = ws.getRow(fila);
      row.getCell(1).value = e.nombre;
      row.getCell(2).value = e.apellido;
      row.getCell(3).value = e.curso ?? "—";
      row.getCell(4).value = e.matricula;
      fila += 1;
    }
  }

  if (workbook.worksheets.length === 0) {
    const ws = workbook.addWorksheet("Estudiantes");
    copiarPlantilla(hojaPlantilla, ws);
    prepararHoja(ws, grupos[0]?.club.nombre ?? "Todos los clubes", null, fechaGeneracion);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
