"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resolveSolicitud } from "@/lib/actions/solicitudes.actions";
import { ESTADO_SOLICITUD_LABEL, TIPO_RESOLUCION_LABEL } from "@/lib/constants";
import type { Club, SolicitudInscripcion } from "@/types";

interface SolicitudDetailModalProps {
  solicitud: SolicitudInscripcion | null;
  clubes: Club[];
  onClose: () => void;
}

function cupoDisponible(club: Club) {
  return club.capacidadMaxima - club.miembrosActuales.length;
}

export function SolicitudDetailModal({ solicitud, clubes, onClose }: SolicitudDetailModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [manualClubId, setManualClubId] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");

  if (!solicitud) return null;

  const clubDeseado = clubes.find((c) => c.id === solicitud.clubDeseadoId);
  const clubAlternativo = clubes.find((c) => c.id === solicitud.clubAlternativoId);
  const pendiente = solicitud.estado === "pendiente";

  function ejecutar(accion: "principal" | "alternativo" | "manual" | "rechazar") {
    startTransition(async () => {
      const res = await resolveSolicitud(solicitud!.id, accion, {
        manualClubId: manualClubId || undefined,
        motivoRechazo: motivoRechazo || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Solicitud actualizada.");
      router.refresh();
      onClose();
    });
  }

  return (
    <Dialog open={!!solicitud} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {solicitud.nombre} {solicitud.apellido}
          </DialogTitle>
          <DialogDescription>Solicitud enviada el {format(new Date(solicitud.fecha), "d MMMM yyyy, HH:mm", { locale: es })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          {!solicitud.estudianteId && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                La matrícula <strong>{solicitud.matricula}</strong> no coincide con ningún estudiante del listado
                vigente. Verifica el dato antes de asignarlo a un club; mientras tanto solo puedes rechazar la
                solicitud.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Curso</p>
              <p className="text-gray-800 dark:text-gray-200">{solicitud.curso}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Matrícula</p>
              <p className="text-gray-800 dark:text-gray-200">{solicitud.matricula}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Club deseado</p>
              <p className="text-gray-800 dark:text-gray-200">
                {clubDeseado?.nombre ?? "—"}{" "}
                {clubDeseado && <span className="text-xs text-gray-400 dark:text-gray-500">({cupoDisponible(clubDeseado)} cupos)</span>}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Club alternativo</p>
              <p className="text-gray-800 dark:text-gray-200">
                {clubAlternativo?.nombre ?? "—"}{" "}
                {clubAlternativo && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">({cupoDisponible(clubAlternativo)} cupos)</span>
                )}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Estado</p>
              <Badge variant={solicitud.estado === "pendiente" ? "warning" : solicitud.estado === "aceptada" ? "success" : "destructive"}>
                {ESTADO_SOLICITUD_LABEL[solicitud.estado]}
              </Badge>
              {solicitud.motivoRechazo && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Motivo: {solicitud.motivoRechazo}</p>}
              {solicitud.resolucion && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Resuelta por: {TIPO_RESOLUCION_LABEL[solicitud.resolucion.tipo]}
                </p>
              )}
            </div>
          </div>

          {pendiente && (
            <div className="space-y-4 border-t border-gray-100 pt-4 dark:border-neutral-800">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => ejecutar("principal")}
                  disabled={isPending || !solicitud.estudianteId || !clubDeseado || cupoDisponible(clubDeseado) <= 0}
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Aceptar en club deseado
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => ejecutar("alternativo")}
                  disabled={isPending || !solicitud.estudianteId || !clubAlternativo || cupoDisponible(clubAlternativo) <= 0}
                >
                  Enviar a club alternativo
                </Button>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="manualClubId">Asignar manualmente a otro club</Label>
                  <Select value={manualClubId} onValueChange={setManualClubId}>
                    <SelectTrigger id="manualClubId">
                      <SelectValue placeholder="Selecciona un club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubes.map((c) => (
                        <SelectItem key={c.id} value={c.id} disabled={cupoDisponible(c) <= 0}>
                          {c.nombre} ({cupoDisponible(c)} cupos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => ejecutar("manual")}
                  disabled={isPending || !solicitud.estudianteId || !manualClubId}
                >
                  Asignar
                </Button>
              </div>

              <div>
                <Label htmlFor="motivoRechazo">Rechazar solicitud</Label>
                <Textarea
                  id="motivoRechazo"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Motivo del rechazo (opcional)"
                  rows={2}
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="destructive" onClick={() => ejecutar("rechazar")} disabled={isPending}>
                    Rechazar solicitud
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
