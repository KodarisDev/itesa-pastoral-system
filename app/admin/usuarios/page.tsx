import { CreateEncargadoDialog } from "@/components/admin/CreateEncargadoDialog";
import { UsersManagementTable } from "@/components/admin/UsersManagementTable";
import { CreateAdminDialog } from "@/components/admin/CreateAdminDialog";
import { AdminUsersManagementTable } from "@/components/admin/AdminUsersManagementTable";
import { ConfiguracionHorarioForm } from "@/components/admin/ConfiguracionHorarioForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPermisosDeUsuario } from "@/lib/db/roles";
import {
  getUsuariosCached,
  getClubesCached,
  getEncargadosCached,
  getEstudiantesCached,
  getRolesCached,
  getConfiguracionCached,
} from "@/lib/db/cached";
import { requireVista } from "@/lib/auth/guards";
import { tienePermiso } from "@/lib/auth/permisos";
import type { Permission } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const session = await requireVista("usuarios:gestionar");

  const [usuarios, clubes, encargados, estudiantes, roles, configuracion] = await Promise.all([
    getUsuariosCached(),
    getClubesCached(),
    getEncargadosCached(),
    getEstudiantesCached(),
    getRolesCached(),
    getConfiguracionCached(),
  ]);
  const puedeEditarHorario = tienePermiso(session.user.permisos, "configuracion:editar");
  const idRolEncargado = roles.find((r) => r.nombre === "encargado_club")?.id_rol;
  const idRolAdmin = roles.find((r) => r.nombre === "admin")?.id_rol;
  const usuariosEncargados = usuarios.filter((u) => u.id_rol === idRolEncargado);
  const administradores = usuarios.filter((u) => u.id_rol === idRolAdmin);
  const encargosPorUsuario = new Map(encargados.map((e) => [e.id_usuario, e]));
  const estudiantesMap = new Map(estudiantes.map((e) => [e.id_estudiante, e]));

  const permisosPorAdmin = await Promise.all(administradores.map((u) => getPermisosDeUsuario(u.id_usuario)));
  const permisosPorUsuario = new Map<number, Permission[]>(administradores.map((u, i) => [u.id_usuario, permisosPorAdmin[i]]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cuentas de acceso al sistema: encargados de club y administradores.</p>
      </div>

      <Tabs defaultValue="encargados">
        <TabsList>
          <TabsTrigger value="encargados">Encargados</TabsTrigger>
          <TabsTrigger value="administradores">Administradores</TabsTrigger>
          {puedeEditarHorario && <TabsTrigger value="horario">Horario</TabsTrigger>}
        </TabsList>

        <TabsContent value="encargados" className="space-y-4">
          <div className="flex justify-end">
            {idRolEncargado != null && <CreateEncargadoDialog clubes={clubes} idRolEncargado={idRolEncargado} />}
          </div>
          <UsersManagementTable
            encargados={usuariosEncargados}
            clubes={clubes}
            encargosPorUsuario={encargosPorUsuario}
            estudiantesMap={estudiantesMap}
          />
        </TabsContent>

        <TabsContent value="administradores" className="space-y-4">
          <div className="flex justify-end">
            <CreateAdminDialog />
          </div>
          {idRolAdmin == null ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-center text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
              El rol &quot;admin&quot; todavía no existe en la base de datos. Corre la migración SQL pendiente para habilitar esta sección.
            </div>
          ) : (
            <AdminUsersManagementTable administradores={administradores} permisosPorUsuario={permisosPorUsuario} />
          )}
        </TabsContent>

        {puedeEditarHorario && (
          <TabsContent value="horario" className="space-y-4">
            <ConfiguracionHorarioForm configuracion={configuracion} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
