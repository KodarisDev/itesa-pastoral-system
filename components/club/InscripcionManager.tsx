"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InscribirEstudianteModal } from "@/components/club/InscribirEstudianteModal";
import type { Estudiante, Subclub } from "@/types";

interface InscripcionManagerProps {
  estudiantes: Estudiante[];
  clubNombre: string;
  /** Modo encargado de subclub (ver InscribirEstudianteModal). */
  subclubes?: Subclub[];
  clubId?: number;
}

export function InscripcionManager({ estudiantes, clubNombre, subclubes, clubId }: InscripcionManagerProps) {
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const modoSubclub = !!subclubes && subclubes.length > 0;
  // Subclub: miembros de este club que aún no tienen subclub. Club general: estudiantes sin club.
  const sinClub = estudiantes.filter((e) => (modoSubclub ? e.id_club === clubId && e.id_subclub == null : e.id_club == null));
  const q = busqueda.trim().toLowerCase();
  const filtrados = q
    ? sinClub.filter((e) => `${e.nombre} ${e.apellido} ${e.matricula} ${e.curso ?? ""}`.toLowerCase().includes(q))
    : sinClub;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">{sinClub.length}</span> estudiante
          {sinClub.length === 1 ? "" : "s"}{" "}
          {modoSubclub
            ? `del club sin subclub, disponible${sinClub.length === 1 ? "" : "s"} para tu subclub`
            : "sin club en todo el instituto"}
        </p>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Inscribir estudiante
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, matrícula o curso"
          className="pl-9"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Matrícula</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((e) => (
              <TableRow key={e.id_estudiante}>
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  {e.nombre} {e.apellido}
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.curso ?? "—"}</TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.matricula}</TableCell>
              </TableRow>
            ))}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  {sinClub.length === 0
                    ? modoSubclub
                      ? "Todos los miembros del club ya tienen subclub."
                      : "Todos los estudiantes tienen un club asignado."
                    : "No se encontraron estudiantes."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <InscribirEstudianteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        estudiantes={estudiantes}
        clubNombre={clubNombre}
        subclubes={subclubes}
        clubId={clubId}
      />
    </div>
  );
}
