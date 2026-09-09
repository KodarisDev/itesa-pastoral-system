"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Pencil } from "lucide-react";
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
import { usuarioEncargadoUpdateSchema } from "@/lib/validations/usuario.schema";
import { updateUsuarioEncargado } from "@/lib/actions/users.actions";
import type { Club, Usuario } from "@/types";

export function EditEncargadoDialog({ usuario, clubes }: { usuario: Usuario; clubes: Club[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tipoPersona, setTipoPersona] = useState<"estudiante" | "profesor">(usuario.tipoPersona ?? "estudiante");
  const [clubId, setClubId] = useState(usuario.clubId ?? "");
  const [password, setPassword] = useState("");

  function reset() {
    setFieldErrors({});
    setTipoPersona(usuario.tipoPersona ?? "estudiante");
    setClubId(usuario.clubId ?? "");
    setPassword("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      tipoPersona,
      clubId,
      password,
    };
    const parsed = usuarioEncargadoUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nombre: flat.nombre?.[0] ?? "",
        username: flat.username?.[0] ?? "",
        tipoPersona: flat.tipoPersona?.[0] ?? "",
        clubId: flat.clubId?.[0] ?? "",
        password: flat.password?.[0] ?? "",
      });
      return;
    }
    setFieldErrors({});
    formData.set("tipoPersona", tipoPersona);
    formData.set("clubId", clubId);
    formData.set("password", password);

    startTransition(async () => {
      const res = await updateUsuarioEncargado(usuario.id, formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Encargado actualizado.");
      router.refresh();
      setOpen(false);
    });
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
        <Button variant="ghost" size="icon" aria-label={`Editar a ${usuario.nombre}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar encargado</DialogTitle>
          <DialogDescription>Actualiza los datos de la cuenta. Deja la contraseña en blanco para conservar la actual.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label htmlFor={`edit-nombre-${usuario.id}`}>Nombre completo</Label>
              <Input
                id={`edit-nombre-${usuario.id}`}
                name="nombre"
                defaultValue={usuario.nombre}
                invalid={!!fieldErrors.nombre}
                placeholder="Ej. Prof. Ana Ramírez"
              />
              {fieldErrors.nombre && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.nombre}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`edit-username-${usuario.id}`}>Usuario</Label>
              <Input
                id={`edit-username-${usuario.id}`}
                name="username"
                defaultValue={usuario.username}
                invalid={!!fieldErrors.username}
                placeholder="Ej. profesor.musica"
              />
              {fieldErrors.username && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`edit-tipoPersona-${usuario.id}`}>Tipo de encargado</Label>
              <Select value={tipoPersona} onValueChange={(v) => setTipoPersona(v as "estudiante" | "profesor")}>
                <SelectTrigger id={`edit-tipoPersona-${usuario.id}`}>
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
              <Label htmlFor={`edit-clubId-${usuario.id}`}>Club a dirigir</Label>
              <Select value={clubId} onValueChange={setClubId}>
                <SelectTrigger id={`edit-clubId-${usuario.id}`}>
                  <SelectValue placeholder="Selecciona un club" />
                </SelectTrigger>
                <SelectContent>
                  {clubes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} {c.encargadoUsuarioId && c.encargadoUsuarioId !== usuario.id ? "(ya tiene encargado)" : ""}
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
            <div>
              <Label htmlFor={`edit-password-${usuario.id}`}>Nueva contraseña (opcional)</Label>
              <Input
                id={`edit-password-${usuario.id}`}
                name="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!fieldErrors.password}
                placeholder="Déjalo en blanco para no cambiarla"
              />
              {fieldErrors.password && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.password}
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
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
