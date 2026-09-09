"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StartNewCycleButton } from "@/components/admin/StartNewCycleButton";
import { ClubMembersTable } from "@/components/admin/ClubMembersTable";
import type { Club, Estudiante, Usuario } from "@/types";

interface ClubDetailModalProps {
  club: Club | null;
  encargado: Usuario | null;
  miembros: Estudiante[];
  onClose: () => void;
}

export function ClubDetailModal({ club, encargado, miembros, onClose }: ClubDetailModalProps) {
  if (!club) return null;

  return (
    <Dialog open={!!club} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{club.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-800">
              {club.fotoUrl ? (
                <Image src={club.fotoUrl} alt={club.nombre} width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">Sin foto</div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{club.descripcion}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {club.miembrosActuales.length} / {club.capacidadMaxima} miembros
                </Badge>
                <Badge variant="outline">{club.duracionMeses} meses de duración</Badge>
                <Badge variant="outline">Ciclo #{club.cicloActual.numero}</Badge>
                {encargado ? (
                  <Badge variant="brand">Encargado: {encargado.nombre}</Badge>
                ) : (
                  <Badge variant="warning">Sin encargado</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <StartNewCycleButton club={club} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Miembros actuales</h3>
            <ClubMembersTable clubId={club.id} miembros={miembros} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
