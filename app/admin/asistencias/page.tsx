import { AttendanceManager } from "@/components/admin/AttendanceManager";
import { getSesionesEnriquecidas, getOpcionesFiltro } from "@/lib/reportes/asistencia";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminAsistenciasPage() {
  await requireVista("asistencia:ver");

  const [sesiones, opciones] = await Promise.all([getSesionesEnriquecidas(), getOpcionesFiltro()]);

  return <AttendanceManager sesiones={sesiones} clubes={opciones.clubes} />;
}
