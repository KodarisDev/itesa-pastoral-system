import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, ClipboardCheck, Shapes, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/StatCard";
import { OccupancyChart } from "@/components/admin/OccupancyChart";
import { getConteoMiembrosPorClub } from "@/lib/db/estudiantes";
import { getClubesCached, getEstudiantesCached } from "@/lib/db/cached";
import { getSesionesEnriquecidas } from "@/lib/reportes/asistencia";

export const dynamic = "force-dynamic";

function fechaUltimoMiercoles(): string {
  const hoy = new Date();
  const diff = (hoy.getDay() - 3 + 7) % 7;
  const miercoles = new Date(hoy);
  miercoles.setDate(hoy.getDate() - diff);
  return miercoles.toISOString().slice(0, 10);
}

export default async function AdminDashboardPage() {
  const [clubes, estudiantes, sesiones, miembrosPorClub] = await Promise.all([
    getClubesCached(),
    getEstudiantesCached(),
    getSesionesEnriquecidas(),
    getConteoMiembrosPorClub(),
  ]);

  const sinClub = estudiantes.filter((e) => e.id_club == null).length;
  const clubesLlenos = clubes.filter((c) => c.capacidad != null && (miembrosPorClub.get(c.id_club) ?? 0) >= c.capacidad).length;

  const fechaMiercoles = fechaUltimoMiercoles();
  const sesionesMiercoles = sesiones.filter((s) => s.fecha === fechaMiercoles);
  const presentesMiercoles = sesionesMiercoles.reduce((acc, s) => acc + s.presentes, 0);
  const totalMiercoles = sesionesMiercoles.reduce((acc, s) => acc + s.total, 0);
  const fechaMiercolesLabel = format(new Date(`${fechaMiercoles}T00:00:00`), "d 'de' MMMM", { locale: es });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Panel general</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Resumen del estado actual de los clubes y las inscripciones.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Estudiantes en el listado" value={estudiantes.length} icon={Users} accent="neutral" />
        <StatCard label="Sin club asignado" value={sinClub} icon={AlertTriangle} accent={sinClub > 0 ? "warning" : "success"} />
        <StatCard
          label={`Asistencia del miércoles ${fechaMiercolesLabel}`}
          value={totalMiercoles > 0 ? `${presentesMiercoles}/${totalMiercoles}` : "Sin registro"}
          icon={ClipboardCheck}
          accent={totalMiercoles === 0 ? "neutral" : presentesMiercoles === totalMiercoles ? "success" : "brand"}
        />
        <StatCard label="Clubes con cupo lleno" value={clubesLlenos} icon={Shapes} accent="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ocupación por club</CardTitle>
          </CardHeader>
          <CardContent>
            <OccupancyChart clubes={clubes} miembrosPorClub={miembrosPorClub} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asistencia del miércoles {fechaMiercolesLabel} por club</CardTitle>
          </CardHeader>
          <CardContent>
            {sesionesMiercoles.length === 0 ? (
              <p className="flex h-72 items-center justify-center text-center text-sm text-gray-400 dark:text-gray-500">
                Ningún club ha pasado lista este miércoles todavía.
              </p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {sesionesMiercoles
                  .slice()
                  .sort((a, b) => a.clubNombre.localeCompare(b.clubNombre))
                  .map((s) => (
                    <div
                      key={s.sesionId}
                      className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 dark:border-neutral-800"
                    >
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.clubNombre}</span>
                      <Badge variant={s.presentes === s.total ? "success" : "secondary"}>
                        {s.presentes} / {s.total} presentes
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
