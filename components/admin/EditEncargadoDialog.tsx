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
import type { Club, Estudiante, Usuario } from "@/types";

interface EditEncargadoDialogProps {
  usuario: Usuario;
  clubes: Club[];
  clubActualId: number | null;
  principalActual: boolean;
  estudianteVinculado: Estudiante | null;
}

export function EditEncargadoDialog({ usuario, clubes, clubActualId, principalActual, estudianteVinculado }: EditEncargadoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clubId, setClubId] = useState(clubActualId ? String(clubActualId) : "");
  const [principal, setPrincipal] = useState(principalActual);
  const [matricula, setMatricula] = useState(estudianteVinculado?.matricula ?? "");
  const [password, setPassword] = useState("");

  function reset() {
    setFieldErrors({});
    setClubId(clubActualId ? String(clubActualId) : "");
    setPrincipal(principalActual);
    setMatricula(estudianteVinculado?.matricula ?? "");
    setPassword("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      idRol: usuario.id_rol,
      clubId,
      principal,
      matriculaEstudiante: matricula,
      password,
    };
    const parsed = usuarioEncargadoUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nombre: flat.nombre?.[0] ?? "",
        username: flat.username?.[0] ?? "",
        password: flat.password?.[0] ?? "",
      });
      return;
    }
    setFieldErrors({});
    formData.set("idRol", String(usuario.id_rol));
    formData.set("clubId", clubId);
    formData.set("principal", String(principal));
    formData.set("matriculaEstudiante", matricula);
    formData.set("password", password);

    startTransition(async () => {
      const res = await updateUsuarioEncargado(usuario.id_usuario, formData);
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
              <Label htmlFor={`edit-nombre-${usuario.id_usuario}`}>Nombre completo</Label>
              <Input
                id={`edit-nombre-${usuario.id_usuario}`}
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
              <Label htmlFor={`edit-username-${usuario.id_usuario}`}>Usuario</Label>
              <Input
                id={`edit-username-${usuario.id_usuario}`}
                name="username"
                defaultValue={usuario.usuario}
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
              <Label htmlFor={`edit-matricula-${usuario.id_usuario}`}>Matrícula (solo si es un estudiante)</Label>
              <Input
                id={`edit-matricula-${usuario.id_usuario}`}
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Déjalo en blanco si es un profesor"
              />
            </div>
            <div>
              <Label htmlFor={`edit-clubId-${usuario.id_usuario}`}>Club a dirigir (opcional)</Label>
              <Select value={clubId || "none"} onValueChange={(v) => setClubId(v === "none" ? "" : v)}>
                <SelectTrigger id={`edit-clubId-${usuario.id_usuario}`}>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {clubes.map((c) => (
                    <SelectItem key={c.id_club} value={String(c.id_club)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {clubId && (
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={principal} onChange={(e) => setPrincipal(e.target.checked)} className="h-4 w-4 rounded" />
                Es el encargado principal del club
              </label>
            )}
            <div>
              <Label htmlFor={`edit-password-${usuario.id_usuario}`}>Nueva contraseña (opcional)</Label>
              <Input
                id={`edit-password-${usuario.id_usuario}`}
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
