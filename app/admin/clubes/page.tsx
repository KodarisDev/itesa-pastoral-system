import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClubsManager } from "@/components/admin/ClubsManager";
import { ClubFormDialog } from "@/components/admin/ClubFormDialog";
import { getClubes } from "@/lib/db/clubes";
import { getUsuarios } from "@/lib/db/usuarios";
import { getEstudiantes } from "@/lib/db/estudiantes";

export const dynamic = "force-dynamic";

export default async function AdminClubesPage() {
  const [clubes, usuarios, estudiantes] = await Promise.all([getClubes(), getUsuarios(), getEstudiantes()]);
  const encargados = usuarios.filter((u) => u.rol === "encargado_club");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Clubes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea y administra los clubes del instituto.</p>
        </div>
        <ClubFormDialog
          mode="crear"
          encargados={encargados}
          trigger={
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo club
            </Button>
          }
        />
      </div>

      <ClubsManager clubes={clubes} encargados={encargados} estudiantes={estudiantes} />
    </div>
  );
}
