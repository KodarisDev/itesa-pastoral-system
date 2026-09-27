"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExportAsistenciaModalProps {
  scope: "admin" | "encargado";
  clubes?: { id: number; nombre: string }[];
  /** Días (YYYY-MM-DD) en los que se pasó lista, sin repetir. */
  fechas: string[];
}

export function ExportAsistenciaModal({ scope, clubes = [], fechas }: ExportAsistenciaModalProps) {
  const [open, setOpen] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [clubId, setClubId] = useState("todos");
  const [fecha, setFecha] = useState("");

  async function handleExportar() {
    const params = new URLSearchParams();
    if (scope === "admin" && clubId !== "todos") params.set("clubId", clubId);
    if (fecha) params.set("fecha", fecha);

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
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="export-fecha">Día de asistencia</Label>
            <Select value={fecha} onValueChange={setFecha}>
              <SelectTrigger id="export-fecha" className="mt-1.5">
                <SelectValue placeholder="Selecciona un día" />
              </SelectTrigger>
              <SelectContent>
                {fechas.map((f) => (
                  <SelectItem key={f} value={f}>
                    {format(new Date(`${f}T00:00:00`), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={descargando}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleExportar} disabled={descargando || !fecha}>
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
