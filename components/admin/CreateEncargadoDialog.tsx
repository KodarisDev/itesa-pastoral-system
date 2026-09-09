"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Copy, Loader2, Plus } from "lucide-react";
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
import { usuarioEncargadoSchema } from "@/lib/validations/usuario.schema";
import { createUsuarioEncargado } from "@/lib/actions/users.actions";
import type { Club } from "@/types";

export function CreateEncargadoDialog({ clubes }: { clubes: Club[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tipoPersona, setTipoPersona] = useState<"estudiante" | "profesor" | "">("");
  const [clubId, setClubId] = useState("");
  const [credenciales, setCredenciales] = useState<{ username: string; password: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  function reset() {
    setFieldErrors({});
    setTipoPersona("");
    setClubId("");
    setCredenciales(null);
    setCopiado(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      tipoPersona: tipoPersona || undefined,
      clubId,
    };
    const parsed = usuarioEncargadoSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nombre: flat.nombre?.[0] ?? "",
        username: flat.username?.[0] ?? "",
        tipoPersona: flat.tipoPersona?.[0] ?? "",
        clubId: flat.clubId?.[0] ?? "",
      });
      return;
    }
    setFieldErrors({});
    formData.set("tipoPersona", tipoPersona);
    formData.set("clubId", clubId);

    startTransition(async () => {
      const res = await createUsuarioEncargado(formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setCredenciales(res.data);
      router.refresh();
    });
  }

  async function copiar() {
    if (!credenciales) return;
    await navigator.clipboard.writeText(`Usuario: ${credenciales.username}\nContraseña: ${credenciales.password}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo encargado
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!credenciales ? (
          <>
            <DialogHeader>
              <DialogTitle>Nuevo encargado de club</DialogTitle>
              <DialogDescription>
                Crea una cuenta para que un estudiante o profesor pueda pasar lista y gestionar su club.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-6 py-6">
                <div>
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input id="nombre" name="nombre" invalid={!!fieldErrors.nombre} placeholder="Ej. Prof. Ana Ramírez" />
                  {fieldErrors.nombre && (
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
                      {fieldErrors.nombre}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="username">Usuario</Label>
                  <Input id="username" name="username" invalid={!!fieldErrors.username} placeholder="Ej. profesor.musica" />
                  {fieldErrors.username && (
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
                      {fieldErrors.username}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tipoPersona">Tipo de encargado</Label>
                  <Select value={tipoPersona} onValueChange={(v) => setTipoPersona(v as "estudiante" | "profesor")}>
                    <SelectTrigger id="tipoPersona">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estudiante">Estudiante</SelectItem>
                      <SelectItem value="profesor">Profesor</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.tipoPersona && (
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
                      {fieldErrors.tipoPersona}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="clubId">Club a dirigir</Label>
                  <Select value={clubId} onValueChange={setClubId}>
                    <SelectTrigger id="clubId">
                      <SelectValue placeholder="Selecciona un club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre} {c.encargadoUsuarioId ? "(ya tiene encargado)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.clubId && (
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
                      {fieldErrors.clubId}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Crear encargado
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cuenta creada</DialogTitle>
              <DialogDescription>
                Guarda esta contraseña ahora: no se volverá a mostrar. Compártela de forma segura con el encargado.
              </DialogDescription>
            </DialogHeader>
            <div className="mx-6 my-6 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900">
              <p>
                Usuario: <span className="font-semibold">{credenciales.username}</span>
              </p>
              <p>
                Contraseña: <span className="font-semibold">{credenciales.password}</span>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={copiar}>
                {copiado ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copiado ? "Copiado" : "Copiar"}
              </Button>
              <Button onClick={() => setOpen(false)}>Listo</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
