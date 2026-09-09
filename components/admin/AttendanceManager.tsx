"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck, ClipboardList, Percent, Shapes } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportAsistenciaModal } from "@/components/shared/ExportAsistenciaModal";
import type { SesionEnriquecida } from "@/lib/reportes/asistencia";

interface AttendanceManagerProps {
  sesiones: SesionEnriquecida[];
  clubes: { id: string; nombre: string }[];
  ciclos: number[];
  anios: string[];
}

export function AttendanceManager({ sesiones, clubes, ciclos, anios }: AttendanceManagerProps) {
  const [clubId, setClubId] = useState("todos");
  const [ciclo, setCiclo] = useState("todos");
  const [anio, setAnio] = useState("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const filtradas = useMemo(() => {
    return sesiones.filter((s) => {
      if (clubId !== "todos" && s.clubId !== clubId) return false;
      if (ciclo !== "todos" && String(s.cicloNumero) !== ciclo) return false;
      if (anio !== "todos" && s.anioEscolar !== anio) return false;
      if (desde && s.fecha < desde) return false;
      if (hasta && s.fecha > hasta) return false;
      return true;
    });
  }, [sesiones, clubId, ciclo, anio, desde, hasta]);

  const totalPresentes = filtradas.reduce((acc, s) => acc + s.presentes, 0);
  const totalRegistros = filtradas.reduce((acc, s) => acc + s.total, 0);
  const porcentaje = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0;
  const clubesConRegistro = new Set(filtradas.map((s) => s.clubId)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Asistencias</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consulta la asistencia registrada por todos los clubes y exporta los datos que necesites.
          </p>
        </div>
        <ExportAsistenciaModal scope="admin" clubes={clubes} ciclos={ciclos} anios={anios} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sesiones registradas" value={filtradas.length} icon={ClipboardList} accent="neutral" />
        <StatCard label="Clubes con registro" value={clubesConRegistro} icon={Shapes} accent="neutral" />
        <StatCard label="Asistencia promedio" value={`${porcentaje}%`} icon={Percent} accent={porcentaje >= 80 ? "success" : "warning"} />
        <StatCard label="Registros totales" value={totalRegistros} icon={CalendarCheck} accent="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3 lg:grid-cols-5">
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
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filtro-ciclo" className="text-xs">
            Ciclo
          </Label>
          <Select value={ciclo} onValueChange={setCiclo}>
            <SelectTrigger id="filtro-ciclo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ciclos.map((c) => (
                <SelectItem key={c} value={String(c)}>
                  Ciclo #{c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filtro-anio" className="text-xs">
            Año escolar
          </Label>
          <Select value={anio} onValueChange={setAnio}>
            <SelectTrigger id="filtro-anio">
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
                  {sesion.cicloNumero != null && <Badge variant="outline">Ciclo #{sesion.cicloNumero}</Badge>}
                </div>
                <Badge variant={sesion.presentes === sesion.total ? "success" : "secondary"}>
                  {sesion.presentes} / {sesion.total} presentes
                </Badge>
              </summary>
              <div className="divide-y divide-gray-100 border-t border-gray-100 px-4 dark:divide-neutral-800 dark:border-neutral-800">
                <div className="flex items-center justify-between py-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>Tomada por {sesion.tomadaPorNombre}</span>
                  <span>{sesion.anioEscolar}</span>
                </div>
                {sesion.registros.map((r) => (
                  <div key={r.estudianteId} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <span className="text-gray-700 dark:text-gray-300">{r.nombreCompleto}</span>
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{r.curso}</span>
                    </div>
                    <Badge variant={r.presente ? "success" : "destructive"}>{r.presente ? "Presente" : "Ausente"}</Badge>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
