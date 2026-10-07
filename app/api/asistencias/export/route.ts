import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { tienePermiso, esSoloEncargadoDeSubclub } from "@/lib/auth/permisos";
import { getSubclubById } from "@/lib/db/subclubes";
import { getClubById, getClubes } from "@/lib/db/clubes";
import { getSesionesEnriquecidas, type FiltroAsistencia } from "@/lib/reportes/asistencia";
import { generarExcelAsistencia } from "@/lib/reportes/asistencia-excel";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { registrarBitacora } from "@/lib/audit";

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

  if (!tienePermiso(session.user.permisos, "asistencia:exportar")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const filtro: FiltroAsistencia = {};
  const descripcion: string[] = [];
  let clubNombreParaArchivo = "todos-los-clubes";
  let clubesParaExportar: string[] = [];
  const fecha = params.get("fecha");

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: "Debes seleccionar un día específico para exportar." }, { status: 400 });
  }

  if (session.user.rolNombre === "encargado_club") {
    const idClub = session.user.clubPrincipalId ?? session.user.clubIds[0];
    if (!idClub) {
      return NextResponse.json({ error: "No tienes un club asignado." }, { status: 403 });
    }
    filtro.clubId = idClub;
    const club = await getClubById(idClub);
    const clubNombre = club?.nombre ?? "club";
    clubesParaExportar = [clubNombre];
    descripcion.push(`Club: ${clubNombre}`);
    clubNombreParaArchivo = slug(clubNombre);
    // Un encargado de subclub solo exporta la asistencia de sus subclubes, no la del club completo.
    if (esSoloEncargadoDeSubclub(session.user)) {
      filtro.subclubIds = session.user.subclubIds;
      const nombres = (await Promise.all(session.user.subclubIds.map((id) => getSubclubById(id)))).map((s) => s?.nombre ?? "subclub");
      descripcion.push(`Subclub: ${nombres.join(", ")}`);
      clubNombreParaArchivo = slug(`${clubNombre}-${nombres.join("-")}`);
    }
  } else {
    // Roles "del sistema" (pastoral, admin): no están ligados a un club, pueden filtrar por cualquiera o ver todos.
    const clubId = params.get("clubId");
    if (clubId && clubId !== "todos") {
      filtro.clubId = Number(clubId);
      const club = await getClubById(Number(clubId));
      const clubNombre = club?.nombre ?? "club";
      clubesParaExportar = [clubNombre];
      descripcion.push(`Club: ${clubNombre}`);
      clubNombreParaArchivo = slug(clubNombre);
    } else {
      clubesParaExportar = (await getClubes()).map((club) => club.nombre);
      descripcion.push("Todos los clubes");
    }
  }

  filtro.fechaDesde = fecha;
  filtro.fechaHasta = fecha;
  descripcion.push(`Fecha: ${fecha}`);

  const sesiones = await getSesionesEnriquecidas(filtro);
  const buffer = await generarExcelAsistencia(sesiones, {
    subtitulo: descripcion.join(" · "),
    clubes: clubesParaExportar,
  });

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  const filename = `asistencia_${clubNombreParaArchivo}_${fechaArchivo}.xlsx`;

  await registrarBitacora({
    session,
    accion: "asistencia.exportar",
    entidad: "asistencia",
    descripcion: `Exportó asistencia a Excel (${descripcion.join(" · ")}).`,
    metadata: { filtro, ip },
    ip,
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
