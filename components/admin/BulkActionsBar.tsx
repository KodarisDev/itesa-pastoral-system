"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Shuffle, Wand2 } from "lucide-react";
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
import { sortearPendientes, asignarAutomaticamente } from "@/lib/actions/solicitudes.actions";

interface BulkActionsBarProps {
  pendientesCount: number;
}

export function BulkActionsBar({ pendientesCount }: BulkActionsBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSortear() {
    startTransition(async () => {
      const res = await sortearPendientes();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Sorteo completado: ${res.data.asignados} asignado(s), ${res.data.sinCupo} sin cupo disponible.`);
      router.refresh();
    });
  }

  function handleAutomatica() {
    startTransition(async () => {
      const res = await asignarAutomaticamente();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Asignación automática completada: ${res.data.asignadosPrincipal} en club deseado, ${res.data.asignadosAlternativo} en alternativo, ${res.data.sinCupo} sin cupo.`,
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="mr-auto text-sm text-gray-500 dark:text-gray-400">
        {pendientesCount} solicitud{pendientesCount === 1 ? "" : "es"} pendiente{pendientesCount === 1 ? "" : "s"}
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isPending || pendientesCount === 0}>
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Asignar automáticamente
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Asignar automáticamente a todos los pendientes?</AlertDialogTitle>
            <AlertDialogDescription>
              Cada solicitud pendiente se asignará a su club deseado si tiene cupo, o al club alternativo si el
              deseado está lleno. Las que no quepan en ninguno de los dos quedarán pendientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAutomatica}>Asignar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isPending || pendientesCount === 0}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Sortear
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Sortear a los estudiantes pendientes?</AlertDialogTitle>
            <AlertDialogDescription>
              Cada solicitud pendiente se asignará al azar a cualquier club que todavía tenga cupo disponible,
              ignorando el club deseado y el alternativo. Úsalo para repartir a quienes no lograron entrar en
              ninguno de sus clubes elegidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSortear}>Sortear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
