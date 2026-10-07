import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClubsManager } from "@/components/admin/ClubsManager";
import { ClubFormDialog } from "@/components/admin/ClubFormDialog";
import { SubclubesPanel } from "@/components/admin/SubclubesPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportEstudiantesClubModal } from "@/components/admin/ExportEstudiantesClubModal";
import {
  getClubesCached,
  getEncargadosCached,
  getUsuariosCached,
  getEstudiantesCached,
  getRolesCached,
  getSubclubesCached,
  getEncargadosSubclubCached,
} from "@/lib/db/cached";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminClubesPage() {
  await requireVista("clubes:ver");

  const [clubes, usuarios, estudiantes, encargados, roles, subclubes, encargadosSubclub] = await Promise.all([
    getClubesCached(),
    getUsuariosCached(),
    getEstudiantesCached(),
    getEncargadosCached(),
    getRolesCached(),
    getSubclubesCached(),
    getEncargadosSubclubCached(),
  ]);
  const idRolEncargado = roles.find((r) => r.nombre === "encargado_club")?.id_rol;
  const usuariosEncargados = usuarios.filter((u) => u.id_rol === idRolEncargado);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Clubes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea y administra los clubes del instituto.</p>
      </div>

      <Tabs defaultValue="clubes">
        <TabsList>
          <TabsTrigger value="clubes">Clubes</TabsTrigger>
          <TabsTrigger value="subclubes">Subclubes</TabsTrigger>
        </TabsList>

        <TabsContent value="clubes" className="space-y-4">
          <ClubsManager
            clubes={clubes}
            usuarios={usuariosEncargados}
            encargados={encargados}
            estudiantes={estudiantes}
            actions={
              <>
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
              </>
            }
          />
        </TabsContent>

        <TabsContent value="subclubes" className="space-y-4">
          <SubclubesPanel
            clubes={clubes}
            estudiantes={estudiantes.filter((e) => e.id_club != null)}
            subclubes={subclubes}
            encargadosSubclub={encargadosSubclub}
            usuariosEncargados={usuariosEncargados.filter((u) => u.activo).map((u) => ({ id_usuario: u.id_usuario, nombre: u.nombre }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
