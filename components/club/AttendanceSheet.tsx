"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { Loader2, Save, Clock, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/shared/Switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitAttendance } from "@/lib/actions/attendance.actions";
import type { RegistroAsistencia } from "@/lib/db/asistencia";
import type { VentanaAsistencia } from "@/lib/asistencia-ventana";
import type { Estudiante } from "@/types";

interface AttendanceSheetProps {
  clubId: number;
  fecha: string;
  miembros: Estudiante[];
  registrosIniciales: RegistroAsistencia[];
  ventana: VentanaAsistencia;
}

export function AttendanceSheet({ clubId, fecha, miembros, registrosIniciales, ventana }: AttendanceSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const mapaInicial = new Map(registrosIniciales.map((r) => [r.id_estudiante, r]));
  const [presencia, setPresencia] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(miembros.map((m) => [m.id_estudiante, mapaInicial.get(m.id_estudiante)?.estado !== "Ausente"])),
  );
  const [justificaciones, setJustificaciones] = useState<Record<number, string>>(() =>
    Object.fromEntries(miembros.map((m) => [m.id_estudiante, mapaInicial.get(m.id_estudiante)?.nota ?? ""])),
  );

  function handleFechaChange(nuevaFecha: string) {
    router.push(`/club/asistencia?fecha=${nuevaFecha}`);
  }

  function handleGuardar() {
    startTransition(async () => {
      const registros = miembros.map((m) => {
        const presente = presencia[m.id_estudiante] ?? false;
        const justificacion = !presente ? justificaciones[m.id_estudiante]?.trim() || undefined : undefined;
        return { estudianteId: m.id_estudiante, presente, justificacion };
      });
      const res = await submitAttendance({ clubId, fecha, registros });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Asistencia guardada.");
      router.refresh();
    });
  }

  const presentes = Object.values(presencia).filter(Boolean).length;
  const bloqueado = ventana.configurada && !ventana.abierta;

  return (
    <div className="space-y-4">
      {ventana.configurada && (
        <div
          className={
            ventana.abierta
              ? "flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-400"
              : "flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400"
          }
        >
          {ventana.abierta ? <Clock className="h-4 w-4 shrink-0" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />}
          {ventana.abierta ? (
            <span>
              Puedes pasar lista hasta el {format(ventana.fin!, "EEEE d 'de' MMMM, h:mm a", { locale: es })}.
            </span>
          ) : (
            <span>
              Fuera del horario de pastoral. Podrás pasar lista de nuevo desde el{" "}
              {format(ventana.siguienteInicio!, "EEEE d 'de' MMMM, h:mm a", { locale: es })}.
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" type="date" defaultValue={fecha} onChange={(e) => handleFechaChange(e.target.value)} className="w-44" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">{presentes}</span> de {miembros.length} presentes
        </p>
      </div>

      {miembros.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
          Tu club todavía no tiene miembros asignados.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {miembros.map((m) => {
            const presente = presencia[m.id_estudiante] ?? false;
            return (
              <div key={m.id_estudiante} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {m.nombre} {m.apellido}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {m.curso ?? "Sin curso"} · {m.matricula}
                    </p>
                  </div>
                  <Switch
                    id={`presente-${m.id_estudiante}`}
                    checked={presente}
                    onCheckedChange={(v) => setPresencia((prev) => ({ ...prev, [m.id_estudiante]: v }))}
                    label={presente ? "Presente" : "Ausente"}
                    disabled={bloqueado}
                  />
                </div>
                {!presente && (
                  <div className="mt-2.5">
                    <Textarea
                      value={justificaciones[m.id_estudiante] ?? ""}
                      onChange={(e) => setJustificaciones((prev) => ({ ...prev, [m.id_estudiante]: e.target.value }))}
                      placeholder="Justificación de la ausencia (opcional)"
                      rows={2}
                      maxLength={240}
                      className="min-h-0 text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {miembros.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleGuardar} disabled={isPending || bloqueado}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Guardar asistencia
          </Button>
        </div>
      )}
    </div>
  );
}
