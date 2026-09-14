"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck, ClipboardList, Percent, Search, Shapes, Users } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExportAsistenciaModal } from "@/components/shared/ExportAsistenciaModal";
import type { SesionEnriquecida } from "@/lib/reportes/asistencia";

interface AttendanceManagerProps {
  sesiones: SesionEnriquecida[];
  clubes: { id: number; nombre: string; miembros: number }[];
}

export function AttendanceManager({ sesiones, clubes }: AttendanceManagerProps) {
  const [clubId, setClubId] = useState("todos");
  const [estudianteQuery, setEstudianteQuery] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [modal, setModal] = useState<"con-registro" | "sin-registro" | null>(null);

  const filtradas = useMemo(() => {
    const q = estudianteQuery.trim().toLowerCase();
    return sesiones
      .filter((s) => {
        if (clubId !== "todos" && String(s.clubId) !== clubId) return false;
        if (desde && s.fecha < desde) return false;
        if (hasta && s.fecha > hasta) return false;
        if (q && !s.registros.some((r) => `${r.nombreCompleto} ${r.matricula}`.toLowerCase().includes(q))) return false;
        return true;
      })
      .map((s) => {
        if (!q) return s;
        const registros = s.registros.filter((r) => `${r.nombreCompleto} ${r.matricula}`.toLowerCase().includes(q));
        return { ...s, registros, presentes: registros.filter((r) => r.presente).length, total: registros.length };
      });
  }, [sesiones, clubId, estudianteQuery, desde, hasta]);

  const totalPresentes = filtradas.reduce((acc, s) => acc + s.presentes, 0);
  const totalRegistros = filtradas.reduce((acc, s) => acc + s.total, 0);
  const porcentaje = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0;

  const clubesConRegistroDetalle = useMemo(() => {
    const porClub = new Map<number, { nombre: string; presentes: number; total: number; sesiones: number }>();
    for (const s of filtradas) {
      const actual = porClub.get(s.clubId) ?? { nombre: s.clubNombre, presentes: 0, total: 0, sesiones: 0 };
      actual.presentes += s.presentes;
      actual.total += s.total;
      actual.sesiones += 1;
      porClub.set(s.clubId, actual);
    }
    return Array.from(porClub.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [filtradas]);

  const clubesSinRegistroDetalle = useMemo(() => {
    const conRegistroIds = new Set(clubesConRegistroDetalle.map((c) => c.id));
    return clubes
      .filter((c) => (clubId === "todos" || String(c.id) === clubId) && !conRegistroIds.has(c.id))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clubes, clubId, clubesConRegistroDetalle]);

  const clubesConRegistro = clubesConRegistroDetalle.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Asistencias</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consulta la asistencia registrada por todos los clubes y exporta los datos que necesites.
          </p>
        </div>
        <ExportAsistenciaModal scope="admin" clubes={clubes} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sesiones registradas" value={filtradas.length} icon={ClipboardList} accent="neutral" />
        <StatCard
          label="Clubes con registro"
          value={clubesConRegistro}
          icon={Shapes}
          accent="success"
          onClick={() => setModal("con-registro")}
        />
        <StatCard
          label="Clubes sin registro"
          value={clubesSinRegistroDetalle.length}
          icon={Users}
          accent="warning"
          onClick={() => setModal("sin-registro")}
        />
        <StatCard label="Asistencia promedio" value={`${porcentaje}%`} icon={Percent} accent={porcentaje >= 80 ? "success" : "warning"} />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <Label htmlFor="filtro-club" className="text-xs">
            Club
          </Label>
          <Select value={clubId} onValueChange={setClubId}>
            <SelectTrigger id="filtro-club">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {clubes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filtro-estudiante" className="text-xs">
            Buscar estudiante
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <Input
              id="filtro-estudiante"
              value={estudianteQuery}
              onChange={(e) => setEstudianteQuery(e.target.value)}
              placeholder="Nombre o matrícula"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="filtro-desde" className="text-xs">
            Desde
          </Label>
          <Input id="filtro-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="filtro-hasta" className="text-xs">
            Hasta
          </Label>
          <Input id="filtro-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
          No hay sesiones de asistencia para estos filtros.
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((sesion) => (
            <details
              key={sesion.sesionId}
              className="group rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(`${sesion.fecha}T00:00:00`), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  </span>
                  <Badge variant="brand">{sesion.clubNombre}</Badge>
                </div>
                <Badge variant={sesion.presentes === sesion.total ? "success" : "secondary"}>
                  {sesion.presentes} / {sesion.total} presentes
                </Badge>
              </summary>
              <div className="divide-y divide-gray-100 border-t border-gray-100 px-4 dark:divide-neutral-800 dark:border-neutral-800">
                <div className="flex items-center justify-between py-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>Tomada por {sesion.tomadaPorNombre}</span>
                </div>
                {sesion.registros.map((r) => (
                  <div key={r.estudianteId} className="py-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-700 dark:text-gray-300">{r.nombreCompleto}</span>
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{r.curso}</span>
                      </div>
                      <Badge variant={r.presente ? "success" : "destructive"}>{r.presente ? "Presente" : "Ausente"}</Badge>
                    </div>
                    {!r.presente && r.justificacion && (
                      <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">&ldquo;{r.justificacion}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}

      <Dialog open={modal === "con-registro"} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clubes con registro</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto px-6 py-6">
            {clubesConRegistroDetalle.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Ningún club ha pasado lista con estos filtros.</p>
            ) : (
              clubesConRegistroDetalle.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.nombre}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {c.sesiones} sesión{c.sesiones === 1 ? "" : "es"} registrada{c.sesiones === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant="success">
                    {c.presentes} / {c.total} presentes
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "sin-registro"} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clubes sin registro</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto px-6 py-6">
            {clubesSinRegistroDetalle.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Todos los clubes han pasado lista con estos filtros.</p>
            ) : (
              clubesSinRegistroDetalle.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.nombre}</p>
                  <Badge variant="warning">{c.miembros} miembro(s)</Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
