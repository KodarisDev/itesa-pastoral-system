"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/shared/Switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitAttendance } from "@/lib/actions/attendance.actions";
import type { Estudiante, RegistroPresencia } from "@/types";

interface AttendanceSheetProps {
  clubId: string;
  fecha: string;
  miembros: Estudiante[];
  registrosIniciales: RegistroPresencia[];
}

export function AttendanceSheet({ clubId, fecha, miembros, registrosIniciales }: AttendanceSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const mapaInicial = new Map(registrosIniciales.map((r) => [r.estudianteId, r.presente]));
  const [presencia, setPresencia] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(miembros.map((m) => [m.id, mapaInicial.get(m.id) ?? true])),
  );

  function handleFechaChange(nuevaFecha: string) {
    router.push(`/club/asistencia?fecha=${nuevaFecha}`);
  }

  function handleGuardar() {
    startTransition(async () => {
      const registros: RegistroPresencia[] = miembros.map((m) => ({
        estudianteId: m.id,
        presente: presencia[m.id] ?? false,
      }));
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

  return (
    <div className="space-y-4">
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
          {miembros.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {m.nombre} {m.apellido}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {m.curso} · {m.matricula}
                </p>
              </div>
              <Switch
                id={`presente-${m.id}`}
                checked={presencia[m.id] ?? false}
                onCheckedChange={(v) => setPresencia((prev) => ({ ...prev, [m.id]: v }))}
                label={presencia[m.id] ? "Presente" : "Ausente"}
              />
            </div>
          ))}
        </div>
      )}

      {miembros.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleGuardar} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Guardar asistencia
          </Button>
        </div>
      )}
    </div>
  );
}
