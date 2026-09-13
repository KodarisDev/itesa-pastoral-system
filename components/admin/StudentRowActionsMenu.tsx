"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, MoreVertical, Repeat, UserMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cambiarClubEstudiante, removeMiembroDeClub } from "@/lib/actions/clubs.actions";
import type { Club, Estudiante } from "@/types";

interface StudentRowActionsMenuProps {
  estudiante: Estudiante;
  clubActualId: number | null;
  clubActualNombre: string | null;
  clubes: Club[];
  miembrosPorClub?: Map<number, number>;
}

export function StudentRowActionsMenu({ estudiante, clubActualId, clubActualNombre, clubes, miembrosPorClub }: StudentRowActionsMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cambiarOpen, setCambiarOpen] = useState(false);
  const [sacarOpen, setSacarOpen] = useState(false);
  const [clubDestinoId, setClubDestinoId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cupoDisponible = useMemo(
    () => (club: Club) => (club.capacidad ?? Infinity) - (miembrosPorClub?.get(club.id_club) ?? 0),
    [miembrosPorClub],
  );

  function handleCambiar() {
    if (!clubDestinoId) return;
    startTransition(async () => {
      const res = await cambiarClubEstudiante(estudiante.id_estudiante, Number(clubDestinoId));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success(`${estudiante.nombre} ${estudiante.apellido} cambió de club.`);
      router.refresh();
      setCambiarOpen(false);
      setClubDestinoId("");
      setError(null);
    });
  }

  function handleSacar() {
    if (!clubActualId) return;
    startTransition(async () => {
      const res = await removeMiembroDeClub(clubActualId, estudiante.id_estudiante);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${estudiante.nombre} ${estudiante.apellido} fue removido del club.`);
      router.refresh();
      setSacarOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Acciones para ${estudiante.nombre} ${estudiante.apellido}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setClubDestinoId("");
              setError(null);
              setCambiarOpen(true);
            }}
          >
            <Repeat className="mr-2 h-4 w-4" aria-hidden="true" />
            Cambiar de club
          </DropdownMenuItem>
          {clubActualId && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSacarOpen(true);
              }}
              className="text-red-600 dark:text-red-400"
            >
              <UserMinus className="mr-2 h-4 w-4" aria-hidden="true" />
              Sacar del club
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={cambiarOpen} onOpenChange={setCambiarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar de club</DialogTitle>
            <DialogDescription>
              {estudiante.nombre} {estudiante.apellido}
              {clubActualNombre ? ` — actualmente en ${clubActualNombre}` : " — sin club asignado"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label htmlFor="club-destino-cambio">Nuevo club</Label>
              <Select value={clubDestinoId} onValueChange={setClubDestinoId}>
                <SelectTrigger id="club-destino-cambio">
                  <SelectValue placeholder="Selecciona un club" />
                </SelectTrigger>
                <SelectContent>
                  {clubes
                    .filter((c) => c.id_club !== clubActualId)
                    .map((c) => (
                      <SelectItem key={c.id_club} value={String(c.id_club)} disabled={cupoDisponible(c) <= 0}>
                        {c.nombre} ({cupoDisponible(c) > 0 ? `${cupoDisponible(c)} cupos` : "sin cupo"})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCambiarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCambiar} disabled={isPending || !clubDestinoId}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={sacarOpen} onOpenChange={setSacarOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Sacar a {estudiante.nombre} {estudiante.apellido} de {clubActualNombre}?
            </AlertDialogTitle>
            <AlertDialogDescription>El estudiante quedará sin club asignado.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSacar} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Sacar del club
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
