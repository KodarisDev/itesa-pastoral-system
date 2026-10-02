"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createSubclub,
  updateSubclub,
  deleteSubclub,
  setSubclubDeEstudiante,
  addEncargadoSubclub,
  removeEncargadoSubclub,
} from "@/lib/actions/subclubes.actions";
import type { ActionResult } from "@/lib/actions/types";
import type { EncargadoSubclub, Estudiante, Subclub } from "@/types";

interface SubclubesManagerProps {
  clubId: number;
  subclubes: Subclub[];
  /** Miembros actuales del club general (un estudiante solo puede estar en un subclub). */
  miembros: Estudiante[];
  encargadosSubclub: EncargadoSubclub[];
  /** Usuarios con rol encargado de club que se pueden asignar a un subclub. */
  usuarios: { id_usuario: number; nombre: string }[];
}

export function SubclubesManager({ clubId, subclubes, miembros, encargadosSubclub, usuarios }: SubclubesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");

  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u.nombre]));
  const sinSubclub = miembros.filter((m) => m.id_subclub == null);

  function ejecutar(accion: () => Promise<ActionResult>, exito: string, despues?: () => void) {
    startTransition(async () => {
      const res = await accion();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(exito);
      despues?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ejecutar(() => createSubclub({ clubId, nombre: nuevoNombre }), "Subclub creado.", () => setNuevoNombre(""));
        }}
      >
        <Input
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre del nuevo subclub"
          maxLength={80}
          aria-label="Nombre del nuevo subclub"
        />
        <Button type="submit" disabled={isPending || nuevoNombre.trim().length < 2}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          Crear
        </Button>
      </form>

      {subclubes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
          Este club todavía no tiene subclubes.
        </div>
      ) : (
        subclubes.map((sc) => {
          const miembrosSc = miembros.filter((m) => m.id_subclub === sc.id_subclub);
          const encargadosSc = encargadosSubclub.filter((e) => e.id_subclub === sc.id_subclub);
          const usuariosDisponibles = usuarios.filter((u) => !encargadosSc.some((e) => e.id_usuario === u.id_usuario));
          const editando = editandoId === sc.id_subclub;

          return (
            <div
              key={sc.id_subclub}
              className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between gap-2">
                {editando ? (
                  <div className="flex flex-1 gap-2">
                    <Input value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} maxLength={80} aria-label="Nuevo nombre" />
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() =>
                        ejecutar(() => updateSubclub(sc.id_subclub, nombreEditado), "Subclub actualizado.", () => setEditandoId(null))
                      }
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Guardar nombre</span>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditandoId(null)}>
                      <X className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Cancelar</span>
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {sc.nombre} <span className="text-xs font-normal text-gray-400">· {miembrosSc.length} miembro{miembrosSc.length === 1 ? "" : "s"}</span>
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditandoId(sc.id_subclub);
                          setNombreEditado(sc.nombre);
                        }}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Renombrar {sc.nombre}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el subclub "${sc.nombre}"? Sus miembros seguirán en el club, sin subclub.`)) {
                            ejecutar(() => deleteSubclub(sc.id_subclub), "Subclub eliminado.");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                        <span className="sr-only">Eliminar {sc.nombre}</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Encargados</p>
                <div className="flex flex-wrap items-center gap-2">
                  {encargadosSc.length === 0 && <span className="text-sm text-gray-400">Sin encargados</span>}
                  {encargadosSc.map((e) => (
                    <Badge key={e.id_encargado_subclub} variant="outline" className="gap-1">
                      {usuariosMap.get(e.id_usuario) ?? `Usuario #${e.id_usuario}`}
                      <button
                        type="button"
                        disabled={isPending}
                        aria-label={`Quitar a ${usuariosMap.get(e.id_usuario) ?? "encargado"}`}
                        onClick={() => ejecutar(() => removeEncargadoSubclub(sc.id_subclub, e.id_usuario), "Encargado quitado.")}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {usuariosDisponibles.length > 0 && (
                  <div className="mt-2 max-w-xs">
                    <Select value="" onValueChange={(v) => ejecutar(() => addEncargadoSubclub(sc.id_subclub, Number(v)), "Encargado asignado.")}>
                      <SelectTrigger aria-label="Agregar encargado">
                        <SelectValue placeholder="Agregar encargado…" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuariosDisponibles.map((u) => (
                          <SelectItem key={u.id_usuario} value={String(u.id_usuario)}>
                            {u.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Miembros</p>
                {miembrosSc.length === 0 ? (
                  <span className="text-sm text-gray-400">Sin miembros</span>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {miembrosSc.map((m) => (
                      <li key={m.id_estudiante} className="flex items-center justify-between py-1.5 text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {m.nombre} {m.apellido} <span className="text-xs text-gray-400">{m.curso ?? ""}</span>
                        </span>
                        <button
                          type="button"
                          disabled={isPending}
                          aria-label={`Quitar a ${m.nombre} ${m.apellido} del subclub`}
                          onClick={() => ejecutar(() => setSubclubDeEstudiante(m.id_estudiante, null, clubId), "Estudiante quitado del subclub.")}
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-red-500" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {sinSubclub.length > 0 && (
                  <div className="mt-2 max-w-xs">
                    <Select
                      value=""
                      onValueChange={(v) => ejecutar(() => setSubclubDeEstudiante(Number(v), sc.id_subclub, clubId), "Estudiante agregado al subclub.")}
                    >
                      <SelectTrigger aria-label="Agregar miembro">
                        <SelectValue placeholder="Agregar miembro del club…" />
                      </SelectTrigger>
                      <SelectContent>
                        {sinSubclub.map((m) => (
                          <SelectItem key={m.id_estudiante} value={String(m.id_estudiante)}>
                            {m.apellido}, {m.nombre} {m.curso ? `(${m.curso})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
