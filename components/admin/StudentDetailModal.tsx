"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Estudiante } from "@/types";

interface StudentDetailModalProps {
  estudiante: Estudiante | null;
  clubActualNombre: string | null;
  onClose: () => void;
}

export function StudentDetailModal({ estudiante, clubActualNombre, onClose }: StudentDetailModalProps) {
  if (!estudiante) return null;

  return (
    <Dialog open={!!estudiante} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {estudiante.nombre} {estudiante.apellido}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {estudiante.curso ?? "Sin curso"} · Matrícula {estudiante.matricula}
          </p>
          <div>
            {clubActualNombre ? (
              <Badge variant="brand">Club actual: {clubActualNombre}</Badge>
            ) : (
              <Badge variant="warning">Sin club asignado actualmente</Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
