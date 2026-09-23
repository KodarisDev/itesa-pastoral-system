import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClubsManager } from "@/components/admin/ClubsManager";
import { ClubFormDialog } from "@/components/admin/ClubFormDialog";
import { ExportEstudiantesClubModal } from "@/components/admin/ExportEstudiantesClubModal";
import { getClubesCached, getEncargadosCached, getUsuariosCached, getEstudiantesCached, getRolesCached } from "@/lib/db/cached";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminClubesPage() {
  await requireVista("clubes:ver");

  const [clubes, usuarios, estudiantes, encargados, roles] = await Promise.all([
    getClubesCached(),
    getUsuariosCached(),
    getEstudiantesCached(),
    getEncargadosCached(),
    getRolesCached(),
  ]);
  const idRolEncargado = roles.find((r) => r.nombre === "encargado_club")?.id_rol;
  const usuariosEncargados = usuarios.filter((u) => u.id_rol === idRolEncargado);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Clubes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea y administra los clubes del instituto.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportEstudiantesClubModal clubes={clubes} />
          <ClubFormDialog
            mode="crear"
            encargados={usuariosEncargados}
            trigger={
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nuevo club
              </Button>
            }
          />
        </div>
      </div>

      <ClubsManager clubes={clubes} usuarios={usuariosEncargados} encargados={encargados} estudiantes={estudiantes} />
    </div>
  );
}
