import { CreateEncargadoDialog } from "@/components/admin/CreateEncargadoDialog";
import { UsersManagementTable } from "@/components/admin/UsersManagementTable";
import { getUsuarios } from "@/lib/db/usuarios";
import { getClubes } from "@/lib/db/clubes";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const [usuarios, clubes] = await Promise.all([getUsuarios(), getClubes()]);
  const encargados = usuarios.filter((u) => u.rol === "encargado_club");
  const clubesMap = new Map(clubes.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Encargados de club</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea y administra las cuentas de acceso de los encargados.</p>
        </div>
        <CreateEncargadoDialog clubes={clubes} />
      </div>

      <UsersManagementTable encargados={encargados} clubesMap={clubesMap} />
    </div>
  );
}
