import PDFDocument from "pdfkit";
import type { ClubConMiembros } from "./clubes";

function compararPorApellido(a: { apellido: string; nombre: string }, b: { apellido: string; nombre: string }) {
  return a.apellido.localeCompare(b.apellido, "es") || a.nombre.localeCompare(b.nombre, "es");
}

const MARGEN = 50;
const COLUMNAS = [
  { label: "Nombre", x: MARGEN, width: 140 },
  { label: "Apellido", x: MARGEN + 140, width: 140 },
  { label: "Curso", x: MARGEN + 280, width: 70 },
  { label: "Matrícula", x: MARGEN + 350, width: 110 },
];

function dibujarEncabezadoTabla(doc: PDFKit.PDFDocument, y: number) {
  doc.font("Helvetica-Bold").fontSize(10);
  for (const col of COLUMNAS) doc.text(col.label, col.x, y, { width: col.width });
  doc
    .moveTo(MARGEN, y + 14)
    .lineTo(MARGEN + 460, y + 14)
    .strokeColor("#cccccc")
    .stroke();
  return y + 20;
}

/** Genera un PDF con una sección por club: encabezado (club, encargado, fecha) + tabla de miembros. */
export async function generarPdfEstudiantesClub(grupos: ClubConMiembros[], fechaGeneracion: string): Promise<Buffer> {
  const doc = new PDFDocument({ margin: MARGEN, size: "letter" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const fin = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const alturaMaxima = doc.page.height - MARGEN;

  if (grupos.length === 0) {
    doc.font("Helvetica").fontSize(12).text("No hay clubes para exportar.", MARGEN, MARGEN);
  }

  grupos.forEach((grupo, index) => {
    if (index > 0) doc.addPage();

    doc.font("Helvetica-Bold").fontSize(18).text(grupo.club.nombre, MARGEN, MARGEN);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#666666")
      .text(`Encargado: ${grupo.encargadoPrincipalNombre ?? "Sin encargado"}`, MARGEN, MARGEN + 26)
      .text(`Generado: ${fechaGeneracion}`, MARGEN, MARGEN + 40)
      .text(`${grupo.miembros.length} estudiante(s)`, MARGEN, MARGEN + 54)
      .fillColor("#000000");

    let y = dibujarEncabezadoTabla(doc, MARGEN + 78);
    const ordenados = [...grupo.miembros].sort(compararPorApellido);

    doc.font("Helvetica").fontSize(9);
    for (const e of ordenados) {
      if (y > alturaMaxima) {
        doc.addPage();
        y = dibujarEncabezadoTabla(doc, MARGEN);
        doc.font("Helvetica").fontSize(9);
      }
      doc.text(e.nombre, COLUMNAS[0].x, y, { width: COLUMNAS[0].width });
      doc.text(e.apellido, COLUMNAS[1].x, y, { width: COLUMNAS[1].width });
      doc.text(e.curso ?? "—", COLUMNAS[2].x, y, { width: COLUMNAS[2].width });
      doc.text(e.matricula, COLUMNAS[3].x, y, { width: COLUMNAS[3].width });
      y += 16;
    }
  });

  doc.end();
  return fin;
}
