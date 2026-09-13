"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ClubMembersTable } from "@/components/admin/ClubMembersTable";
import type { Club, Encargado, Estudiante, Usuario } from "@/types";

interface EncargadoConNombre extends Encargado {
  usuarioNombre: string;
}

interface ClubDetailModalProps {
  club: Club | null;
  encargados: EncargadoConNombre[];
  miembros: Estudiante[];
  onClose: () => void;
}

export function ClubDetailModal({ club, encargados, miembros, onClose }: ClubDetailModalProps) {
  if (!club) return null;

  const principal = encargados.find((e) => e.encargado_principal);
  const secundarios = encargados.filter((e) => !e.encargado_principal);

  return (
    <Dialog open={!!club} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{club.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-800">
              {club.foto ? (
                <Image src={club.foto} alt={club.nombre} width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">Sin foto</div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{club.descripcion}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {miembros.length} / {club.capacidad ?? "∞"} miembros
                </Badge>
                {principal ? (
                  <Badge variant="brand">Encargado: {principal.usuarioNombre}</Badge>
                ) : (
                  <Badge variant="warning">Sin encargado principal</Badge>
                )}
                {secundarios.map((s) => (
                  <Badge key={s.id_encargado} variant="outline">
                    Encargado: {s.usuarioNombre}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Miembros actuales</h3>
            <ClubMembersTable clubId={club.id_club} miembros={miembros} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
