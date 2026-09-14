"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { actualizarConfiguracion } from "@/lib/actions/configuracion.actions";
import { DIAS_SEMANA, type Configuracion } from "@/types";

export function ConfiguracionHorarioForm({ configuracion }: { configuracion: Configuracion | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [diaClub, setDiaClub] = useState(configuracion?.dia_club ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("diaClub", diaClub);

    startTransition(async () => {
      const res = await actualizarConfiguracion(formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Horario de pastoral actualizado.");
      router.refresh();
    });
  }

  return (
    <div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">Hora de pastoral</h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Un solo día y hora para todos los clubes — no se configura por club individual.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="diaClub">Día</Label>
          <Select value={diaClub || "none"} onValueChange={(v) => setDiaClub(v === "none" ? "" : v)}>
            <SelectTrigger id="diaClub">
              <SelectValue placeholder="Sin definir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin definir</SelectItem>
              {DIAS_SEMANA.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="horaClub">Hora</Label>
          <Input id="horaClub" name="horaClub" type="time" defaultValue={configuracion?.hora_club?.slice(0, 5) ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
