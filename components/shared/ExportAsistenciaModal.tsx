"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ModoFecha = "todas" | "especifica" | "rango";

interface ExportAsistenciaModalProps {
  scope: "admin" | "encargado";
  clubes?: { id: string; nombre: string }[];
  ciclos: number[];
  anios: string[];
}

export function ExportAsistenciaModal({ scope, clubes = [], ciclos, anios }: ExportAsistenciaModalProps) {
  const [open, setOpen] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [clubId, setClubId] = useState("todos");
  const [modoFecha, setModoFecha] = useState<ModoFecha>("todas");
  const [fecha, setFecha] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [ciclo, setCiclo] = useState("todos");
  const [anio, setAnio] = useState("todos");

  async function handleExportar() {
    const params = new URLSearchParams();
    if (scope === "admin" && clubId !== "todos") params.set("clubId", clubId);
    if (ciclo !== "todos") params.set("ciclo", ciclo);
    if (anio !== "todos") params.set("anioEscolar", anio);
    if (modoFecha === "especifica" && fecha) params.set("fecha", fecha);
    if (modoFecha === "rango") {
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
    }

    setDescargando(true);
    try {
      const res = await fetch(`/api/asistencias/export?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "No se pudo generar el Excel." }));
        toast.error(body.error ?? "No se pudo generar el Excel.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "asistencia.xlsx";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Excel descargado.");
      setOpen(false);
    } catch {
      toast.error("No se pudo generar el Excel. Inténtalo de nuevo.");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          Exportar a Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar asistencia</DialogTitle>
          <DialogDescription>Elige qué registros quieres incluir en el archivo Excel.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          {scope === "admin" && (
            <div>
              <Label htmlFor="export-club">Club</Label>
              <Select value={clubId} onValueChange={setClubId}>
                <SelectTrigger id="export-club">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los clubes</SelectItem>
                  {clubes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Fechas</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800">
              {(
                [
                  { value: "todas", label: "Todas" },
                  { value: "especifica", label: "Fecha exacta" },
                  { value: "rango", label: "Rango" },
                ] as const
              ).map((opcion) => (
                <button
                  key={opcion.value}
                  type="button"
                  onClick={() => setModoFecha(opcion.value)}
                  className={cn(
                    "rounded-lg py-1.5 text-xs font-medium transition-colors",
                    modoFecha === opcion.value
                      ? "bg-white text-red-700 shadow-sm dark:bg-neutral-950 dark:text-red-400"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white",
                  )}
                >
                  {opcion.label}
                </button>
              ))}
            </div>

            {modoFecha === "especifica" && (
              <Input type="date" className="mt-2" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            )}
            {modoFecha === "rango" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="export-desde" className="text-xs font-normal text-gray-500">
                    Desde
                  </Label>
                  <Input id="export-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="export-hasta" className="text-xs font-normal text-gray-500">
                    Hasta
                  </Label>
                  <Input id="export-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="export-ciclo">Ciclo</Label>
              <Select value={ciclo} onValueChange={setCiclo}>
                <SelectTrigger id="export-ciclo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los ciclos</SelectItem>
                  {ciclos.map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      Ciclo #{c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="export-anio">Año escolar</Label>
              <Select value={anio} onValueChange={setAnio}>
                <SelectTrigger id="export-anio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {anios.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={descargando}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleExportar} disabled={descargando}>
            {descargando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Descargar Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
