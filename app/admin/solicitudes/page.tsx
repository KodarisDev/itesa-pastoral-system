import { SolicitudesManager } from "@/components/admin/SolicitudesManager";
import { getSolicitudes } from "@/lib/db/solicitudes";
import { getClubes } from "@/lib/db/clubes";

export const dynamic = "force-dynamic";

export default async function AdminSolicitudesPage() {
  const [solicitudes, clubes] = await Promise.all([getSolicitudes(), getClubes()]);
  const ordenadas = [...solicitudes].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Solicitudes de inscripción</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Revisa cada solicitud y asígnala a un club, o usa las acciones masivas para resolver varias a la vez.
        </p>
      </div>
      <SolicitudesManager solicitudes={ordenadas} clubes={clubes} />
    </div>
  );
}
