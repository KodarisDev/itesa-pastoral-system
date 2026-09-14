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
import { cn } from "@/lib/utils";
import type { Club, Usuario } from "@/types";

interface ClubsTableProps {
  clubes: Club[];
  encargadosDisponibles: Usuario[];
  principalPorClub: Map<number, string>;
  principalIdPorClub: Map<number, number>;
  secundarioIdPorClub: Map<number, number>;
  miembrosPorClub: Map<number, number>;
  onSelect: (club: Club) => void;
}

interface ClubRowAccionesProps {
  club: Club;
  encargadoPrincipalId?: number | null;
  encargadoSecundarioId?: number | null;
  encargadosDisponibles: Usuario[];
  isPending: boolean;
  onDelete: (clubId: number) => void;
  onSelect: (club: Club) => void;
}

function ClubRowAcciones({
  club,
  encargadoPrincipalId,
  encargadoSecundarioId,
  encargadosDisponibles,
  isPending,
  onDelete,
  onSelect,
}: ClubRowAccionesProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ClubFormDialog
        mode="editar"
        club={club}
        encargadoPrincipalId={encargadoPrincipalId}
        encargadoSecundarioId={encargadoSecundarioId}
        encargados={encargadosDisponibles}
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
            <AlertDialogAction onClick={() => onDelete(club.id_club)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button variant="ghost" size="icon" aria-label={`Ver ${club.nombre}`} onClick={() => onSelect(club)}>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function ClubsTable({
  clubes,
  encargadosDisponibles,
  principalPorClub,
  principalIdPorClub,
  secundarioIdPorClub,
  miembrosPorClub,
  onSelect,
}: ClubsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(clubId: number) {
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
      {/* Mobile: tarjetas — una tabla de varias columnas no cabe cómodamente en pantallas chicas */}
      <div className="space-y-2 md:hidden">
        {clubes.map((club) => {
          const encargadoNombre = principalPorClub.get(club.id_club);
          const miembros = miembrosPorClub.get(club.id_club) ?? 0;
          const lleno = club.capacidad != null && miembros >= club.capacidad;
          const sinEncargado = !encargadoNombre;
          return (
            <div key={club.id_club} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(club)}
                  className={cn(
                    "text-left font-medium hover:text-red-700 dark:hover:text-red-400",
                    sinEncargado ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100",
                  )}
                >
                  {club.nombre}
                </button>
                <Badge variant={lleno ? "destructive" : "secondary"}>
                  {miembros} / {club.capacidad ?? "∞"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {encargadoNombre ? <span>{encargadoNombre}</span> : <Badge variant="warning">Sin encargado</Badge>}
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
                <ClubRowAcciones
                  club={club}
                  encargadoPrincipalId={principalIdPorClub.get(club.id_club)}
                  encargadoSecundarioId={secundarioIdPorClub.get(club.id_club)}
                  encargadosDisponibles={encargadosDisponibles}
                  isPending={isPending}
                  onDelete={handleDelete}
                  onSelect={onSelect}
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
              <TableHead>Club</TableHead>
              <TableHead>Encargado</TableHead>
              <TableHead>Miembros</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubes.map((club) => {
              const encargadoNombre = principalPorClub.get(club.id_club);
              const miembros = miembrosPorClub.get(club.id_club) ?? 0;
              const lleno = club.capacidad != null && miembros >= club.capacidad;
              const sinEncargado = !encargadoNombre;
              return (
                <TableRow key={club.id_club}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onSelect(club)}
                      className={cn(
                        "font-medium hover:text-red-700 dark:hover:text-red-400",
                        sinEncargado ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100",
                      )}
                    >
                      {club.nombre}
                    </button>
                  </TableCell>
                  <TableCell>
                    {encargadoNombre ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{encargadoNombre}</span>
                    ) : (
                      <Badge variant="warning">Sin encargado</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lleno ? "destructive" : "secondary"}>
                      {miembros} / {club.capacidad ?? "∞"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ClubRowAcciones
                      club={club}
                      encargadoPrincipalId={principalIdPorClub.get(club.id_club)}
                      encargadoSecundarioId={secundarioIdPorClub.get(club.id_club)}
                      encargadosDisponibles={encargadosDisponibles}
                      isPending={isPending}
                      onDelete={handleDelete}
                      onSelect={onSelect}
                    />
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
