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

interface ExportAsistenciaModalProps {
  scope: "admin" | "encargado";
  clubes?: { id: number; nombre: string }[];
}

export function ExportAsistenciaModal({ scope, clubes = [] }: ExportAsistenciaModalProps) {
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
            <Input id="export-fecha" type="date" className="mt-1.5" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
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
