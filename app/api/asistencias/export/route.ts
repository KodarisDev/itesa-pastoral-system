import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { tienePermiso } from "@/lib/auth/permisos";
import { getClubById } from "@/lib/db/clubes";
import { getSesionesEnriquecidas, type FiltroAsistencia } from "@/lib/reportes/asistencia";
import { generarExcelAsistencia } from "@/lib/reportes/asistencia-excel";

function slug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!tienePermiso(session.user.permisos, "asistencia:exportar")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const filtro: FiltroAsistencia = {};
  const descripcion: string[] = [];
  let clubNombreParaArchivo = "todos-los-clubes";

  if (session.user.rolNombre === "encargado_club") {
    const idClub = session.user.clubPrincipalId ?? session.user.clubIds[0];
    if (!idClub) {
      return NextResponse.json({ error: "No tienes un club asignado." }, { status: 403 });
    }
    filtro.clubId = idClub;
    const club = await getClubById(idClub);
    descripcion.push(`Club: ${club?.nombre ?? "—"}`);
    clubNombreParaArchivo = slug(club?.nombre ?? "club");
  } else {
    // Roles "del sistema" (pastoral, admin): no están ligados a un club, pueden filtrar por cualquiera o ver todos.
    const clubId = params.get("clubId");
    if (clubId && clubId !== "todos") {
      filtro.clubId = Number(clubId);
      const club = await getClubById(Number(clubId));
      descripcion.push(`Club: ${club?.nombre ?? "—"}`);
      clubNombreParaArchivo = slug(club?.nombre ?? "club");
    } else {
      descripcion.push("Todos los clubes");
    }
  }

  const fecha = params.get("fecha");
  const desde = params.get("desde");
  const hasta = params.get("hasta");
  if (fecha) {
    filtro.fechaDesde = fecha;
    filtro.fechaHasta = fecha;
    descripcion.push(`Fecha: ${fecha}`);
  } else if (desde || hasta) {
    if (desde) filtro.fechaDesde = desde;
    if (hasta) filtro.fechaHasta = hasta;
    descripcion.push(`Del ${desde ?? "inicio"} al ${hasta ?? "hoy"}`);
  } else {
    descripcion.push("Todas las fechas");
  }

  const sesiones = await getSesionesEnriquecidas(filtro);
  const buffer = await generarExcelAsistencia(sesiones, { subtitulo: descripcion.join(" · ") });

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  const filename = `asistencia_${clubNombreParaArchivo}_${fechaArchivo}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
