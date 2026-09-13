"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Search, UserCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inscribirEstudianteEnMiClub } from "@/lib/actions/inscripcion.actions";
import type { Estudiante } from "@/types";

interface InscribirEstudianteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudiantes: Estudiante[];
  clubNombre: string;
}

export function InscribirEstudianteModal({ open, onOpenChange, estudiantes, clubNombre }: InscribirEstudianteModalProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estudianteId, setEstudianteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEstudianteId(null);
      setBusqueda("");
      setError(null);
    }
  }, [open]);

  const estudianteSeleccionado = useMemo(
    () => estudiantes.find((e) => e.id_estudiante === estudianteId) ?? null,
    [estudiantes, estudianteId],
  );

  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return estudiantes
      .filter((e) => `${e.nombre} ${e.apellido} ${e.matricula}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [estudiantes, busqueda]);

  async function handleConfirmar() {
    if (!estudianteId) return;
    setIsPending(true);
    setError(null);
    const res = await inscribirEstudianteEnMiClub(estudianteId);
    setIsPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.success("Estudiante inscrito.");
    router.refresh();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Inscribir estudiante</DialogTitle>
          <DialogDescription>
            Busca a un estudiante sin club y agrégalo a {clubNombre}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          {!estudianteSeleccionado ? (
            <div>
              <Label htmlFor="buscar-estudiante-club">Estudiante</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                <Input
                  id="buscar-estudiante-club"
                  autoFocus
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Matrícula o nombre del estudiante"
                  className="pl-9"
                />
              </div>

              {busqueda.trim() !== "" && (
                <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-neutral-700">
                  {resultados.length === 0 ? (
                    <p className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                      No se encontró ningún estudiante.
                    </p>
                  ) : (
                    resultados.map((e) => {
                      const disponible = e.id_club == null;
                      return (
                        <button
                          key={e.id_estudiante}
                          type="button"
                          disabled={!disponible}
                          onClick={() => disponible && setEstudianteId(e.id_estudiante)}
                          className="flex w-full items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent dark:border-neutral-800 dark:hover:bg-neutral-800"
                        >
                          <span>
                            <span className="block text-sm font-medium text-gray-900 dark:text-white">
                              {e.nombre} {e.apellido}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {e.curso ?? "Sin curso"} · {e.matricula}
                            </span>
                          </span>
                          {!disponible && (
                            <span className="shrink-0 text-xs font-medium text-amber-600 dark:text-amber-400">Ya está en un club</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label>Estudiante</Label>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800">
                <span className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                  <UserCheck className="h-4 w-4 text-brand" aria-hidden="true" />
                  <span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {estudianteSeleccionado.nombre} {estudianteSeleccionado.apellido}
                    </span>{" "}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      · {estudianteSeleccionado.curso ?? "Sin curso"} · {estudianteSeleccionado.matricula}
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setEstudianteId(null)}
                  aria-label="Cambiar estudiante"
                  className="shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Se inscribirá en {clubNombre}.</p>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={isPending || !estudianteSeleccionado}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Inscribir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
