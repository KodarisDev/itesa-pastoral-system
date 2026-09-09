"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { startNewCycle } from "@/lib/actions/clubs.actions";
import type { Club } from "@/types";

export function StartNewCycleButton({ club }: { club: Club }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const res = await startNewCycle(club.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Nuevo ciclo iniciado. ${res.data.archivados} estudiante(s) pasaron al historial.`);
      router.refresh();
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Iniciar nuevo ciclo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Iniciar un nuevo ciclo de &quot;{club.nombre}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            Los {club.miembrosActuales.length} miembro(s) actuales pasarán al historial del club y quedarán fuera de
            la lista de miembros. El club quedará abierto para nuevas inscripciones (ciclo #
            {club.cicloActual.numero + 1}). Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Iniciar nuevo ciclo</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
