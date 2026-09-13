"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Copy, KeyRound, Trash2 } from "lucide-react";
import { EditEncargadoDialog } from "@/components/admin/EditEncargadoDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUsuarioEncargado, resetPasswordEncargado } from "@/lib/actions/users.actions";
import type { Club, Encargado, Estudiante, Usuario } from "@/types";

interface UsersManagementTableProps {
  encargados: Usuario[];
  clubes: Club[];
  encargosPorUsuario: Map<number, Encargado>;
  estudiantesMap: Map<number, Estudiante>;
}

interface UserRowAccionesProps {
  usuario: Usuario;
  clubes: Club[];
  clubActualId: number | null;
  principalActual: boolean;
  estudianteVinculado: Estudiante | null;
  onReset: (usuario: Usuario) => void;
  onDelete: (usuarioId: number) => void;
}

function UserRowAcciones({ usuario, clubes, clubActualId, principalActual, estudianteVinculado, onReset, onDelete }: UserRowAccionesProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <EditEncargadoDialog
        usuario={usuario}
        clubes={clubes}
        clubActualId={clubActualId}
        principalActual={principalActual}
        estudianteVinculado={estudianteVinculado}
      />
      <Button variant="ghost" size="icon" aria-label={`Restablecer contraseña de ${usuario.nombre}`} onClick={() => onReset(usuario)}>
        <KeyRound className="h-4 w-4" aria-hidden="true" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Eliminar a ${usuario.nombre}`}>
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {usuario.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>Perderá acceso al panel de su club de inmediato. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(usuario.id_usuario)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function UsersManagementTable({ encargados, clubes, encargosPorUsuario, estudiantesMap }: UsersManagementTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [nuevaPassword, setNuevaPassword] = useState<{ username: string; password: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const clubesMap = new Map(clubes.map((c) => [c.id_club, c]));

  function handleReset(usuario: Usuario) {
    startTransition(async () => {
      const res = await resetPasswordEncargado(usuario.id_usuario);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setNuevaPassword({ username: usuario.usuario, password: res.data.password });
    });
  }

  function handleDelete(usuarioId: number) {
    startTransition(async () => {
      const res = await deleteUsuarioEncargado(usuarioId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Encargado eliminado.");
      router.refresh();
    });
  }

  async function copiar() {
    if (!nuevaPassword) return;
    await navigator.clipboard.writeText(nuevaPassword.password);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (encargados.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Todavía no has creado ningún encargado de club.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: tarjetas — una tabla de varias columnas no cabe cómodamente en pantallas chicas */}
      <div className="space-y-2 md:hidden">
        {encargados.map((u) => {
          const encargo = encargosPorUsuario.get(u.id_usuario);
          const clubNombre = encargo ? clubesMap.get(encargo.id_club)?.nombre : undefined;
          const estudiante = u.id_estudiante ? estudiantesMap.get(u.id_estudiante) ?? null : null;
          return (
            <div key={u.id_usuario} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{u.nombre}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{u.usuario}</p>
                </div>
                {estudiante ? <Badge variant="secondary">Estudiante</Badge> : <Badge variant="secondary">Profesor</Badge>}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{clubNombre ?? "—"}</p>
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
                <UserRowAcciones
                  usuario={u}
                  clubes={clubes}
                  clubActualId={encargo?.id_club ?? null}
                  principalActual={encargo?.encargado_principal ?? false}
                  estudianteVinculado={estudiante}
                  onReset={handleReset}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / tablet: tabla completa */}
      <div className="hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Rol en el club</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {encargados.map((u) => {
              const encargo = encargosPorUsuario.get(u.id_usuario);
              const clubNombre = encargo ? clubesMap.get(encargo.id_club)?.nombre : undefined;
              const estudiante = u.id_estudiante ? estudiantesMap.get(u.id_estudiante) ?? null : null;
              return (
                <TableRow key={u.id_usuario}>
                  <TableCell className="font-medium text-gray-900 dark:text-white">{u.nombre}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{u.usuario}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{clubNombre ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={encargo?.encargado_principal ? "brand" : "outline"}>
                      {encargo?.encargado_principal ? "Principal" : "Secundario"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRowAcciones
                      usuario={u}
                      clubes={clubes}
                      clubActualId={encargo?.id_club ?? null}
                      principalActual={encargo?.encargado_principal ?? false}
                      estudianteVinculado={estudiante}
                      onReset={handleReset}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!nuevaPassword} onOpenChange={(v) => !v && setNuevaPassword(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contraseña restablecida</AlertDialogTitle>
            <AlertDialogDescription>
              Guarda esta contraseña ahora: no se volverá a mostrar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {nuevaPassword && (
            <div className="mx-6 my-6 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900">
              <p>
                Usuario: <span className="font-semibold">{nuevaPassword.username}</span>
              </p>
              <p>
                Nueva contraseña: <span className="font-semibold">{nuevaPassword.password}</span>
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <Button variant="outline" onClick={copiar}>
              {copiado ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiado ? "Copiado" : "Copiar"}
            </Button>
            <AlertDialogAction onClick={() => setNuevaPassword(null)}>Listo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
