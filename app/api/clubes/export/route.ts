import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { tienePermiso } from "@/lib/auth/permisos";
import { getClubesConMiembros } from "@/lib/reportes/clubes";
import { generarExcelEstudiantesClub } from "@/lib/reportes/clubes-excel";
import { generarPdfEstudiantesClub } from "@/lib/reportes/clubes-pdf";
import { consumeRateLimit } from "@/lib/security/rate-limit";

function slug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (!consumeRateLimit("export", ip, 30, 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas exportaciones. Espera un minuto antes de volver a intentarlo." }, { status: 429 });
  }
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!tienePermiso(session.user.permisos, "clubes:ver")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const formato = params.get("formato") === "pdf" ? "pdf" : "xlsx";
  const clubIdParam = params.get("clubId");
  const idClub = clubIdParam && clubIdParam !== "todos" ? Number(clubIdParam) : undefined;

  const grupos = await getClubesConMiembros(idClub);
  if (idClub != null && grupos.length === 0) {
    return NextResponse.json({ error: "El club seleccionado no existe." }, { status: 404 });
  }

  const ahora = new Date();
  const fechaGeneracionTexto = ahora.toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" });
  const clubNombreParaArchivo = idClub != null ? slug(grupos[0].club.nombre) : "todos-los-clubes";
  const fechaArchivo = ahora.toISOString().slice(0, 10);

  if (formato === "pdf") {
    const buffer = await generarPdfEstudiantesClub(grupos, fechaGeneracionTexto);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="estudiantes_${clubNombreParaArchivo}_${fechaArchivo}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const buffer = await generarExcelEstudiantesClub(grupos, ahora);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="estudiantes_${clubNombreParaArchivo}_${fechaArchivo}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
