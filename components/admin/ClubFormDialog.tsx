"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clubSchema } from "@/lib/validations/club.schema";
import { createClub, updateClub } from "@/lib/actions/clubs.actions";
import { TIPO_PERSONA_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Club, Usuario } from "@/types";

interface ClubFormDialogProps {
  mode: "crear" | "editar";
  club?: Club;
  encargados: Usuario[];
  trigger: ReactNode;
}

export function ClubFormDialog({ mode, club, encargados, trigger }: ClubFormDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [encargadoId, setEncargadoId] = useState(club?.encargadoUsuarioId ?? "");

  const disponibles = encargados.filter((u) => !u.clubId || u.clubId === club?.id);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      capacidadMaxima: formData.get("capacidadMaxima"),
      duracionMeses: formData.get("duracionMeses"),
      encargadoUsuarioId: encargadoId || null,
    };
    const parsed = clubSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nombre: flat.nombre?.[0] ?? "",
        descripcion: flat.descripcion?.[0] ?? "",
        capacidadMaxima: flat.capacidadMaxima?.[0] ?? "",
        duracionMeses: flat.duracionMeses?.[0] ?? "",
      });
      return;
    }
    setFieldErrors({});
    formData.set("encargadoUsuarioId", encargadoId);

    startTransition(async () => {
      const res = mode === "crear" ? await createClub(formData) : await updateClub(club!.id, formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(mode === "crear" ? "Club creado correctamente." : "Club actualizado correctamente.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "crear" ? "Nuevo club" : `Editar ${club?.nombre}`}</DialogTitle>
          <DialogDescription>
            {mode === "crear"
              ? "Completa la información del club. Podrás asignar un encargado después de crear su usuario en Encargados."
              : "Actualiza la información del club."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label htmlFor="nombre">Nombre del club</Label>
              <Input id="nombre" name="nombre" defaultValue={club?.nombre} invalid={!!fieldErrors.nombre} placeholder="Ej. Coro y Música" />
              {fieldErrors.nombre && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.nombre}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                defaultValue={club?.descripcion}
                invalid={!!fieldErrors.descripcion}
                placeholder="¿De qué trata este club?"
              />
              {fieldErrors.descripcion && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.descripcion}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacidadMaxima">Cupo máximo</Label>
                <Input
                  id="capacidadMaxima"
                  name="capacidadMaxima"
                  type="number"
                  min={1}
                  defaultValue={club?.capacidadMaxima}
                  invalid={!!fieldErrors.capacidadMaxima}
                />
                {fieldErrors.capacidadMaxima && (
                  <p role="alert" className="mt-1.5 text-sm text-destructive">
                    {fieldErrors.capacidadMaxima}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="duracionMeses">Duración (meses)</Label>
                <Input
                  id="duracionMeses"
                  name="duracionMeses"
                  type="number"
                  min={1}
                  max={12}
                  defaultValue={club?.duracionMeses}
                  invalid={!!fieldErrors.duracionMeses}
                />
                {fieldErrors.duracionMeses && (
                  <p role="alert" className="mt-1.5 text-sm text-destructive">
                    {fieldErrors.duracionMeses}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="foto">Foto del club (opcional)</Label>
              <input
                id="foto"
                name="foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={cn(
                  "block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200 dark:text-gray-300 dark:file:bg-neutral-800 dark:hover:file:bg-neutral-700",
                )}
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">JPG, PNG o WEBP, máximo 2MB.</p>
            </div>

            <div>
              <Label htmlFor="encargadoUsuarioId">Encargado del club</Label>
              <Select value={encargadoId || "none"} onValueChange={(v) => setEncargadoId(v === "none" ? "" : v)}>
                <SelectTrigger id="encargadoUsuarioId">
                  <SelectValue placeholder="Sin encargado asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin encargado asignado</SelectItem>
                  {disponibles.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre} ({TIPO_PERSONA_LABEL[u.tipoPersona ?? "estudiante"]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Para crear un encargado nuevo, ve a la sección Encargados.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {mode === "crear" ? "Crear club" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
