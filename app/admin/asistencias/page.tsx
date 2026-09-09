import { AttendanceManager } from "@/components/admin/AttendanceManager";
import { getSesionesEnriquecidas, getOpcionesFiltro } from "@/lib/reportes/asistencia";

export const dynamic = "force-dynamic";

export default async function AdminAsistenciasPage() {
  const [sesiones, opciones] = await Promise.all([getSesionesEnriquecidas(), getOpcionesFiltro()]);

  return (
    <AttendanceManager
      sesiones={sesiones}
      clubes={opciones.clubes}
      ciclos={opciones.ciclos}
      anios={opciones.anios}
    />
  );
}
