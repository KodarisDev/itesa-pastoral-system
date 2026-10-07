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
import type { Club, Estudiante, Subclub } from "@/types";

interface StudentRowActionsMenuProps {
  estudiante: Estudiante;
  clubActualId: number | null;
  clubActualNombre: string | null;
  clubes: Club[];
  subclubes: Subclub[];
  miembrosPorClub?: Map<number, number>;
}

export function StudentRowActionsMenu({ estudiante, clubActualId, clubActualNombre, clubes, subclubes, miembrosPorClub }: StudentRowActionsMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cambiarOpen, setCambiarOpen] = useState(false);
  const [sacarOpen, setSacarOpen] = useState(false);
  const [clubDestinoId, setClubDestinoId] = useState("");
  const [subclubDestinoId, setSubclubDestinoId] = useState("__ninguno__");
  const [error, setError] = useState<string | null>(null);

  const cupoDisponible = useMemo(
    () => (club: Club) => (club.capacidad ?? Infinity) - (miembrosPorClub?.get(club.id_club) ?? 0),
    [miembrosPorClub],
  );

  const subclubesDelDestino = useMemo(
    () => (clubDestinoId ? subclubes.filter((s) => s.id_club === Number(clubDestinoId)) : []),
    [subclubes, clubDestinoId],
  );
  const subclubActual = subclubes.find((s) => s.id_subclub === estudiante.id_subclub) ?? null;
  const subclubNuevo = subclubDestinoId === "__ninguno__" ? null : Number(subclubDestinoId);
  const mismoClub = clubDestinoId !== "" && Number(clubDestinoId) === clubActualId;
  // Quedarse en el mismo club solo tiene sentido si cambia el subclub.
  const hayCambio = clubDestinoId !== "" && (!mismoClub || subclubNuevo !== (estudiante.id_subclub ?? null));

  function elegirClub(valor: string) {
    setClubDestinoId(valor);
    // Al volver al club actual se propone su subclub actual; en otro club, sin subclub.
    setSubclubDestinoId(Number(valor) === clubActualId && estudiante.id_subclub != null ? String(estudiante.id_subclub) : "__ninguno__");
  }

  function handleCambiar() {
    if (!hayCambio) return;
    startTransition(async () => {
      const res = await cambiarClubEstudiante(estudiante.id_estudiante, Number(clubDestinoId), subclubNuevo);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success(`${estudiante.nombre} ${estudiante.apellido} ${mismoClub ? "cambió de subclub" : "cambió de club"}.`);
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
              setSubclubDestinoId("__ninguno__");
              setError(null);
              setCambiarOpen(true);
            }}
          >
            <Repeat className="mr-2 h-4 w-4" aria-hidden="true" />
            Cambiar de club / subclub
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
              {clubActualNombre
                ? ` — actualmente en ${clubActualNombre}${subclubActual ? ` · ${subclubActual.nombre}` : ""}`
                : " — sin club asignado"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label htmlFor="club-destino-cambio">Club</Label>
              <Select value={clubDestinoId} onValueChange={elegirClub}>
                <SelectTrigger id="club-destino-cambio">
                  <SelectValue placeholder="Selecciona un club" />
                </SelectTrigger>
                <SelectContent>
                  {clubes
                    // El club actual solo se ofrece si tiene subclubes (para moverlo de subclub).
                    .filter((c) => c.id_club !== clubActualId || subclubes.some((s) => s.id_club === c.id_club))
                    .map((c) =>
                      c.id_club === clubActualId ? (
                        <SelectItem key={c.id_club} value={String(c.id_club)}>
                          {c.nombre} (club actual)
                        </SelectItem>
                      ) : (
                        <SelectItem key={c.id_club} value={String(c.id_club)} disabled={cupoDisponible(c) <= 0}>
                          {c.nombre} ({cupoDisponible(c) > 0 ? `${cupoDisponible(c)} cupos` : "sin cupo"})
                        </SelectItem>
                      ),
                    )}
                </SelectContent>
              </Select>
            </div>
            {subclubesDelDestino.length > 0 && (
              <div>
                <Label htmlFor="subclub-destino-cambio">Subclub</Label>
                <Select value={subclubDestinoId} onValueChange={setSubclubDestinoId}>
                  <SelectTrigger id="subclub-destino-cambio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ninguno__">Sin subclub</SelectItem>
                    {subclubesDelDestino.map((s) => (
                      <SelectItem key={s.id_subclub} value={String(s.id_subclub)}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
            <Button onClick={handleCambiar} disabled={isPending || !hayCambio}>
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
            <AlertDialogDescription>
              El estudiante quedará sin club asignado{subclubActual ? ` y saldrá del subclub ${subclubActual.nombre}` : ""}.
            </AlertDialogDescription>
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
