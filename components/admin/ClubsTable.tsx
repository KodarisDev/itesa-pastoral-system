"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Pencil, Trash2, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClubFormDialog } from "@/components/admin/ClubFormDialog";
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
import { deleteClub } from "@/lib/actions/clubs.actions";
import type { Club, Usuario } from "@/types";

interface ClubsTableProps {
  clubes: Club[];
  encargados: Usuario[];
  onSelect: (club: Club) => void;
}

interface ClubRowAccionesProps {
  club: Club;
  encargados: Usuario[];
  isPending: boolean;
  onDelete: (clubId: string) => void;
  onSelect: (club: Club) => void;
}

function ClubRowAcciones({ club, encargados, isPending, onDelete, onSelect }: ClubRowAccionesProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ClubFormDialog
        mode="editar"
        club={club}
        encargados={encargados}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Editar ${club.nombre}`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Eliminar ${club.nombre}`} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &quot;{club.nombre}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Solo puedes eliminar un club si no tiene miembros actuales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(club.id)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button variant="ghost" size="icon" aria-label={`Ver ${club.nombre}`} onClick={() => onSelect(club)}>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function ClubsTable({ clubes, encargados, onSelect }: ClubsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const encargadosMap = new Map(encargados.map((u) => [u.id, u]));

  function handleDelete(clubId: string) {
    startTransition(async () => {
      const res = await deleteClub(clubId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Club eliminado.");
      router.refresh();
    });
  }

  if (clubes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Todavía no has creado ningún club.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: tarjetas — una tabla de 6 columnas no cabe cómodamente en pantallas chicas */}
      <div className="space-y-2 md:hidden">
        {clubes.map((club) => {
          const encargado = club.encargadoUsuarioId ? encargadosMap.get(club.encargadoUsuarioId) : undefined;
          const lleno = club.miembrosActuales.length >= club.capacidadMaxima;
          return (
            <div key={club.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => onSelect(club)}
                    className="text-left font-medium text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                  >
                    {club.nombre}
                  </button>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{club.duracionMeses <= 4 ? "Ciclo corto" : "Ciclo largo"}</p>
                </div>
                <Badge variant={lleno ? "destructive" : "secondary"}>
                  {club.miembrosActuales.length} / {club.capacidadMaxima}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {encargado ? <span>{encargado.nombre}</span> : <Badge variant="warning">Sin encargado</Badge>}
                <span className="text-gray-300 dark:text-neutral-700">·</span>
                <span>{club.duracionMeses} meses</span>
                <span className="text-gray-300 dark:text-neutral-700">·</span>
                <span>Ciclo #{club.cicloActual.numero}</span>
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
                <ClubRowAcciones club={club} encargados={encargados} isPending={isPending} onDelete={handleDelete} onSelect={onSelect} />
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
              <TableHead>Club</TableHead>
              <TableHead>Encargado</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead>Miembros</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubes.map((club) => {
              const encargado = club.encargadoUsuarioId ? encargadosMap.get(club.encargadoUsuarioId) : undefined;
              const lleno = club.miembrosActuales.length >= club.capacidadMaxima;
              return (
                <TableRow key={club.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onSelect(club)}
                      className="font-medium text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                    >
                      {club.nombre}
                    </button>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{club.duracionMeses <= 4 ? "Ciclo corto" : "Ciclo largo"}</p>
                  </TableCell>
                  <TableCell>
                    {encargado ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{encargado.nombre}</span>
                    ) : (
                      <Badge variant="warning">Sin encargado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{club.duracionMeses} meses</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">Ciclo #{club.cicloActual.numero}</TableCell>
                  <TableCell>
                    <Badge variant={lleno ? "destructive" : "secondary"}>
                      {club.miembrosActuales.length} / {club.capacidadMaxima}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ClubRowAcciones club={club} encargados={encargados} isPending={isPending} onDelete={handleDelete} onSelect={onSelect} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
