import { AttendanceManager } from "@/components/admin/AttendanceManager";
import { getSesionesEnriquecidas, getOpcionesFiltro } from "@/lib/reportes/asistencia";
import { getConteoMiembrosPorClub } from "@/lib/db/estudiantes";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminAsistenciasPage() {
  await requireVista("asistencia:ver");

  const [sesiones, opciones, miembrosPorClub] = await Promise.all([
    getSesionesEnriquecidas(),
    getOpcionesFiltro(),
    getConteoMiembrosPorClub(),
  ]);

  const clubes = opciones.clubes.map((c) => ({ ...c, miembros: miembrosPorClub.get(c.id) ?? 0 }));

  return <AttendanceManager sesiones={sesiones} clubes={clubes} />;
}
