"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentRowActionsMenu } from "@/components/admin/StudentRowActionsMenu";
import type { Club, Estudiante } from "@/types";

interface StudentsTableProps {
  estudiantes: Estudiante[];
  clubes: Club[];
  clubPorEstudiante: Map<string, string>;
  onSelect: (estudiante: Estudiante) => void;
}

const SIN_CLUB = "__sin_club__";
const CON_CLUB = "__con_club__";

export function StudentsTable({ estudiantes, clubes, clubPorEstudiante, onSelect }: StudentsTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("todos");
  const [clubFiltro, setClubFiltro] = useState("todos");

  const cursos = useMemo(
    () => Array.from(new Set(estudiantes.map((e) => e.curso))).sort((a, b) => a.localeCompare(b)),
    [estudiantes],
  );
  const clubesOrdenados = useMemo(() => [...clubes].sort((a, b) => a.nombre.localeCompare(b.nombre)), [clubes]);
  const clubIdPorEstudiante = useMemo(() => {
    const map = new Map<string, string>();
    for (const club of clubes) {
      for (const id of club.miembrosActuales) map.set(id, club.id);
    }
    return map;
  }, [clubes]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return estudiantes.filter((e) => {
      if (q && !`${e.nombre} ${e.apellido} ${e.matricula} ${e.curso}`.toLowerCase().includes(q)) return false;
      if (curso !== "todos" && e.curso !== curso) return false;

      if (clubFiltro !== "todos") {
        const clubNombre = clubPorEstudiante.get(e.id);
        if (clubFiltro === SIN_CLUB) {
          if (clubNombre) return false;
        } else if (clubFiltro === CON_CLUB) {
          if (!clubNombre) return false;
        } else if (clubNombre !== clubFiltro) {
          return false;
        }
      }

      return true;
    });
  }, [estudiantes, busqueda, curso, clubFiltro, clubPorEstudiante]);

  const hayFiltrosActivos = busqueda !== "" || curso !== "todos" || clubFiltro !== "todos";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative max-w-sm flex-1">
          <Label htmlFor="busqueda-estudiante" className="text-xs">
            Buscar
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <Input
              id="busqueda-estudiante"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, matrícula o curso"
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full sm:w-44">
          <Label htmlFor="filtro-curso" className="text-xs">
            Curso
          </Label>
          <Select value={curso} onValueChange={setCurso}>
            <SelectTrigger id="filtro-curso">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {cursos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-52">
          <Label htmlFor="filtro-club" className="text-xs">
            Club
          </Label>
          <Select value={clubFiltro} onValueChange={setClubFiltro}>
            <SelectTrigger id="filtro-club">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value={CON_CLUB}>Con club</SelectItem>
              <SelectItem value={SIN_CLUB}>Sin club</SelectItem>
              {clubesOrdenados.map((c) => (
                <SelectItem key={c.id} value={c.nombre}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setCurso("todos");
              setClubFiltro("todos");
            }}
            className="text-sm font-medium text-brand hover:text-brand-dark sm:mb-2.5"
          >
            Quitar filtros
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-500">
          No se encontraron estudiantes.
        </div>
      ) : (
        <>
          {/* Mobile: lista de tarjetas — una tabla de 4+ columnas no cabe cómodamente en pantallas chicas */}
          <div className="space-y-2 md:hidden">
            {filtrados.map((e) => {
              const clubNombre = clubPorEstudiante.get(e.id) ?? null;
              const clubId = clubIdPorEstudiante.get(e.id) ?? null;
              return (
                <div key={e.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(e)}
                      className="text-left font-medium text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                    >
                      {e.nombre} {e.apellido}
                    </button>
                    <StudentRowActionsMenu estudiante={e} clubActualId={clubId} clubActualNombre={clubNombre} clubes={clubes} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {e.curso} · {e.matricula}
                  </p>
                  <div className="mt-2">
                    {clubNombre ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{clubNombre}</span>
                    ) : (
                      <Badge variant="warning">Sin club</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop / tablet: tabla completa */}
          <div className="hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Club actual</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((e) => {
                  const clubNombre = clubPorEstudiante.get(e.id) ?? null;
                  const clubId = clubIdPorEstudiante.get(e.id) ?? null;
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
                      <TableCell className="text-right">
                        <StudentRowActionsMenu estudiante={e} clubActualId={clubId} clubActualNombre={clubNombre} clubes={clubes} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
