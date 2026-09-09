"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Copy, KeyRound, Trash2 } from "lucide-react";
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
import { TIPO_PERSONA_LABEL } from "@/lib/constants";
import type { Club, Usuario } from "@/types";

interface UsersManagementTableProps {
  encargados: Usuario[];
  clubesMap: Map<string, Club>;
}

export function UsersManagementTable({ encargados, clubesMap }: UsersManagementTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [nuevaPassword, setNuevaPassword] = useState<{ username: string; password: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  function handleReset(usuario: Usuario) {
    startTransition(async () => {
      const res = await resetPasswordEncargado(usuario.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setNuevaPassword({ username: usuario.username, password: res.data.password });
    });
  }

  function handleDelete(usuarioId: string) {
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
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Club</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {encargados.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-gray-900 dark:text-white">{u.nombre}</TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{u.username}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{TIPO_PERSONA_LABEL[u.tipoPersona ?? "estudiante"]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {u.clubId ? clubesMap.get(u.clubId)?.nombre ?? "—" : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Restablecer contraseña de ${u.nombre}`} onClick={() => handleReset(u)}>
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Eliminar a ${u.nombre}`}>
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar a {u.nombre}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Perderá acceso al panel de su club de inmediato. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(u.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
