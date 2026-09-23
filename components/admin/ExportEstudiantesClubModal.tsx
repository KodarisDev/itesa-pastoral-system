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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Club } from "@/types";

export function ExportEstudiantesClubModal({ clubes }: { clubes: Club[] }) {
  const [open, setOpen] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [clubId, setClubId] = useState("todos");
  const [formato, setFormato] = useState<"xlsx" | "pdf">("xlsx");

  async function handleExportar() {
    const params = new URLSearchParams();
    if (clubId !== "todos") params.set("clubId", clubId);
    params.set("formato", formato);

    setDescargando(true);
    try {
      const res = await fetch(`/api/clubes/export?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "No se pudo generar el reporte." }));
        toast.error(body.error ?? "No se pudo generar el reporte.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `estudiantes.${formato}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(formato === "pdf" ? "PDF descargado." : "Excel descargado.");
      setOpen(false);
    } catch {
      toast.error("No se pudo generar el reporte. Inténtalo de nuevo.");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          Exportar estudiantes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar listado de estudiantes</DialogTitle>
          <DialogDescription>Elige el club y el formato del reporte. Incluye el club, el encargado y la fecha de generación.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div>
            <Label htmlFor="export-estudiantes-club">Club</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger id="export-estudiantes-club">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los clubes</SelectItem>
                {clubes.map((c) => (
                  <SelectItem key={c.id_club} value={String(c.id_club)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="export-estudiantes-formato">Formato</Label>
            <Select value={formato} onValueChange={(v) => setFormato(v as "xlsx" | "pdf")}>
              <SelectTrigger id="export-estudiantes-formato">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
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
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
