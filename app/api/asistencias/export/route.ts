import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

  const params = req.nextUrl.searchParams;
  const filtro: FiltroAsistencia = {};
  const descripcion: string[] = [];
  let clubNombreParaArchivo = "todos-los-clubes";

  if (session.user.rol === "encargado_club") {
    if (!session.user.clubId) {
      return NextResponse.json({ error: "No tienes un club asignado." }, { status: 403 });
    }
    filtro.clubId = session.user.clubId;
    const club = await getClubById(session.user.clubId);
    descripcion.push(`Club: ${club?.nombre ?? "—"}`);
    clubNombreParaArchivo = slug(club?.nombre ?? "club");
  } else if (session.user.rol === "pastoral") {
    const clubId = params.get("clubId");
    if (clubId && clubId !== "todos") {
      filtro.clubId = clubId;
      const club = await getClubById(clubId);
      descripcion.push(`Club: ${club?.nombre ?? "—"}`);
      clubNombreParaArchivo = slug(club?.nombre ?? "club");
    } else {
      descripcion.push("Todos los clubes");
    }
  } else {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const anio = params.get("anioEscolar");
  if (anio) {
    filtro.anioEscolar = anio;
    descripcion.push(`Año escolar: ${anio}`);
  }

  const ciclo = params.get("ciclo");
  if (ciclo) {
    filtro.cicloNumero = Number(ciclo);
    descripcion.push(`Ciclo #${ciclo}`);
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
  if (sesiones.length === 0) {
    return NextResponse.json(
      { error: "No hay registros de asistencia para los filtros seleccionados." },
      { status: 404 },
    );
  }

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
