"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserMinus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { removeMiembroDeClub } from "@/lib/actions/clubs.actions";
import type { Estudiante } from "@/types";

interface ClubMembersTableProps {
  clubId: string;
  miembros: Estudiante[];
}

export function ClubMembersTable({ clubId, miembros }: ClubMembersTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleRemove(estudianteId: string) {
    startTransition(async () => {
      const res = await removeMiembroDeClub(clubId, estudianteId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Estudiante removido del club.");
      router.refresh();
    });
  }

  if (miembros.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Este club todavía no tiene miembros.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {miembros.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <Link href={`/admin/estudiantes?matricula=${e.matricula}`} className="font-medium text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400">
                  {e.nombre} {e.apellido}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.curso}</TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.matricula}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Quitar a ${e.nombre}`}>
                      <UserMinus className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Quitar a {e.nombre} {e.apellido} del club?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        El estudiante quedará sin club asignado hasta que se le reasigne manualmente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(e.id)}>Quitar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
