"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { previewRoster, confirmRosterUpload } from "@/lib/actions/students.actions";
import type { ResultadoParseoExcel } from "@/lib/excel";

export function RosterUploadDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [anioEscolar, setAnioEscolar] = useState(String(new Date().getFullYear()));
  const [preview, setPreview] = useState<ResultadoParseoExcel | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await previewRoster(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPreview(res.data);
    });
  }

  function handleConfirm() {
    if (!preview) return;
    startTransition(async () => {
      const res = await confirmRosterUpload(preview.validas, anioEscolar);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Listado cargado: ${res.data.totalEstudiantes} estudiante(s). ${res.data.archivados} membresía(s) de club pasaron al historial.`,
      );
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Cargar listado (Excel)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cargar listado de estudiantes</DialogTitle>
          <DialogDescription>
            Sube el Excel con columnas Nombre, Apellido, Curso y Matrícula. Esto reemplaza el listado vigente e
            inicia un nuevo año escolar: las membresías actuales de todos los clubes pasarán al historial.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <form onSubmit={handlePreview}>
            <div className="space-y-4 px-6 py-6">
              <div>
                <Label htmlFor="anioEscolar">Año escolar</Label>
                <Input
                  id="anioEscolar"
                  value={anioEscolar}
                  onChange={(e) => setAnioEscolar(e.target.value)}
                  placeholder="Ej. 2026 o 2026-2027"
                />
              </div>
              <div>
                <Label htmlFor="archivo">Archivo Excel (.xlsx)</Label>
                <input
                  ref={fileInputRef}
                  id="archivo"
                  name="archivo"
                  type="file"
                  accept=".xlsx,.xls"
                  required
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200 dark:text-gray-300 dark:file:bg-neutral-800 dark:hover:file:bg-neutral-700"
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Previsualizar
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="space-y-4 px-6 py-6">
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900">
                <span className="font-medium text-green-700 dark:text-green-400">{preview.validas.length} filas válidas</span>
                {preview.invalidas.length > 0 && (
                  <span className="text-amber-700 dark:text-amber-400">{preview.invalidas.length} con errores</span>
                )}
                {preview.duplicadas.length > 0 && (
                  <span className="text-amber-700 dark:text-amber-400">{preview.duplicadas.length} matrículas duplicadas</span>
                )}
              </div>

              {preview.invalidas.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    Se omitirán las filas con errores. Ejemplo: fila {preview.invalidas[0].fila} — {preview.invalidas[0].error}
                  </p>
                </div>
              )}

              <div className="max-h-64 overflow-auto rounded-xl border border-gray-200 dark:border-neutral-700">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-neutral-900 dark:text-gray-400">
                    <tr>
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2">Apellido</th>
                      <th className="px-3 py-2">Curso</th>
                      <th className="px-3 py-2">Matrícula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.validas.slice(0, 50).map((fila, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-neutral-800">
                        <td className="px-3 py-1.5">{fila.nombre}</td>
                        <td className="px-3 py-1.5">{fila.apellido}</td>
                        <td className="px-3 py-1.5">{fila.curso}</td>
                        <td className="px-3 py-1.5">{fila.matricula}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.validas.length > 50 && (
                  <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">y {preview.validas.length - 50} más…</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={reset} disabled={isPending}>
                Elegir otro archivo
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Confirmar carga
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
