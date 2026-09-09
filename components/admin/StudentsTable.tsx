"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Estudiante } from "@/types";

interface StudentsTableProps {
  estudiantes: Estudiante[];
  clubPorEstudiante: Map<string, string>;
  onSelect: (estudiante: Estudiante) => void;
}

export function StudentsTable({ estudiantes, clubPorEstudiante, onSelect }: StudentsTableProps) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter((e) =>
      `${e.nombre} ${e.apellido} ${e.matricula} ${e.curso}`.toLowerCase().includes(q),
    );
  }, [estudiantes, busqueda]);

  return (
    <div className="space-y-3">
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
              <TableHead>Club actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((e) => {
              const clubNombre = clubPorEstudiante.get(e.id);
              return (
                <TableRow key={e.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onSelect(e)}
                      className="font-medium text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                    >
                      {e.nombre} {e.apellido}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.curso}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.matricula}</TableCell>
                  <TableCell>
                    {clubNombre ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{clubNombre}</span>
                    ) : (
                      <Badge variant="warning">Sin club</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  No se encontraron estudiantes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
