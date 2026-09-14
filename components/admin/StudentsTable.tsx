"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentRowActionsMenu } from "@/components/admin/StudentRowActionsMenu";
import type { Club, Estudiante } from "@/types";

interface StudentsTableProps {
  estudiantes: Estudiante[];
  clubes: Club[];
  onSelect: (estudiante: Estudiante) => void;
}

const SIN_CLUB = "__sin_club__";
const CON_CLUB = "__con_club__";

function compararPorApellido(a: Estudiante, b: Estudiante) {
  return a.apellido.localeCompare(b.apellido, "es") || a.nombre.localeCompare(b.nombre, "es");
}

export function StudentsTable({ estudiantes, clubes, onSelect }: StudentsTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [clubFiltro, setClubFiltro] = useState("todos");

  const clubesMap = useMemo(() => new Map(clubes.map((c) => [c.id_club, c.nombre])), [clubes]);
  const clubesOrdenados = useMemo(() => [...clubes].sort((a, b) => a.nombre.localeCompare(b.nombre)), [clubes]);

  // Los cursos se muestran como páginas, ordenados 4A..4G, 5A..5G, 6A..6G (el
  // orden lexicográfico ya coincide con ese orden dado el formato "<grado><letra>").
  const cursos = useMemo(
    () => Array.from(new Set(estudiantes.map((e) => e.curso).filter((c): c is string => !!c))).sort(),
    [estudiantes],
  );

  const [cursoIndex, setCursoIndex] = useState(0);
  useEffect(() => {
    if (cursoIndex > cursos.length - 1) setCursoIndex(0);
  }, [cursos.length, cursoIndex]);

  const cursoActual = cursos[cursoIndex] ?? null;

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return estudiantes
      .filter((e) => {
        if (e.curso !== cursoActual) return false;
        if (q && !`${e.nombre} ${e.apellido} ${e.matricula}`.toLowerCase().includes(q)) return false;

        if (clubFiltro !== "todos") {
          if (clubFiltro === SIN_CLUB) {
            if (e.id_club != null) return false;
          } else if (clubFiltro === CON_CLUB) {
            if (e.id_club == null) return false;
          } else if (String(e.id_club) !== clubFiltro) {
            return false;
          }
        }

        return true;
      })
      .sort(compararPorApellido);
  }, [estudiantes, cursoActual, busqueda, clubFiltro]);

  const hayFiltrosActivos = busqueda !== "" || clubFiltro !== "todos";

  if (cursos.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-500">
        No hay estudiantes cargados todavía.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Curso anterior"
          disabled={cursoIndex === 0}
          onClick={() => setCursoIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="flex flex-col items-center gap-1">
          <Select value={cursoActual ?? ""} onValueChange={(v) => setCursoIndex(cursos.indexOf(v))}>
            <SelectTrigger className="h-9 w-32 justify-center gap-1.5 text-center text-lg font-semibold [&>span]:mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cursos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {filtrados.length} de {estudiantes.filter((e) => e.curso === cursoActual).length} estudiante(s) · curso {cursoIndex + 1} de{" "}
            {cursos.length}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Curso siguiente"
          disabled={cursoIndex === cursos.length - 1}
          onClick={() => setCursoIndex((i) => Math.min(cursos.length - 1, i + 1))}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative max-w-sm flex-1">
          <Label htmlFor="busqueda-estudiante" className="text-xs">
            Buscar en {cursoActual}
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <Input
              id="busqueda-estudiante"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, apellido o matrícula"
              className="pl-9"
            />
          </div>
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
                <SelectItem key={c.id_club} value={String(c.id_club)}>
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
          No se encontraron estudiantes en {cursoActual} con estos filtros.
        </div>
      ) : (
        <>
          {/* Mobile: lista de tarjetas — una tabla de 4+ columnas no cabe cómodamente en pantallas chicas */}
          <div className="space-y-2 md:hidden">
            {filtrados.map((e) => {
              const clubNombre = e.id_club != null ? clubesMap.get(e.id_club) ?? null : null;
              return (
                <div key={e.id_estudiante} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(e)}
                      className="text-left font-medium text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                    >
                      {e.apellido}, {e.nombre}
                    </button>
                    <StudentRowActionsMenu estudiante={e} clubActualId={e.id_club} clubActualNombre={clubNombre} clubes={clubes} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {e.curso ?? "Sin curso"} · {e.matricula}
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
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Club actual</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((e) => {
                  const clubNombre = e.id_club != null ? clubesMap.get(e.id_club) ?? null : null;
                  return (
                    <TableRow key={e.id_estudiante}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => onSelect(e)}
                          className="font-medium text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                        >
                          {e.apellido}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.nombre}</TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">{e.matricula}</TableCell>
                      <TableCell>
                        {clubNombre ? (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{clubNombre}</span>
                        ) : (
                          <Badge variant="warning">Sin club</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <StudentRowActionsMenu estudiante={e} clubActualId={e.id_club} clubActualNombre={clubNombre} clubes={clubes} />
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
