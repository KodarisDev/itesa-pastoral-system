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
import { PermisosFieldset } from "@/components/admin/PermisosFieldset";
import { usuarioAdminUpdateSchema } from "@/lib/validations/usuario.schema";
import { updateUsuarioAdmin } from "@/lib/actions/users.actions";
import type { Permission, Usuario } from "@/types";

interface EditAdminDialogProps {
  usuario: Usuario;
  permisosActuales: Permission[];
}

export function EditAdminDialog({ usuario, permisosActuales }: EditAdminDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [permisos, setPermisos] = useState<Permission[]>(permisosActuales);
  const [password, setPassword] = useState("");

  function reset() {
    setFieldErrors({});
    setPermisos(permisosActuales);
    setPassword("");
  }

  function togglePermiso(permiso: Permission, marcado: boolean) {
    setPermisos((prev) => (marcado ? [...prev, permiso] : prev.filter((p) => p !== permiso)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = usuarioAdminUpdateSchema.safeParse({
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      permisos: formData.getAll("permisos"),
      password,
    });
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
    formData.set("password", password);

    startTransition(async () => {
      const res = await updateUsuarioAdmin(usuario.id_usuario, formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Administrador actualizado.");
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
          <DialogTitle>Editar administrador</DialogTitle>
          <DialogDescription>Actualiza los datos y permisos de la cuenta. Deja la contraseña en blanco para conservar la actual.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label htmlFor={`edit-admin-nombre-${usuario.id_usuario}`}>Nombre completo</Label>
              <Input
                id={`edit-admin-nombre-${usuario.id_usuario}`}
                name="nombre"
                defaultValue={usuario.nombre}
                invalid={!!fieldErrors.nombre}
              />
              {fieldErrors.nombre && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.nombre}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`edit-admin-username-${usuario.id_usuario}`}>Usuario</Label>
              <Input
                id={`edit-admin-username-${usuario.id_usuario}`}
                name="username"
                defaultValue={usuario.usuario}
                invalid={!!fieldErrors.username}
              />
              {fieldErrors.username && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div>
              <Label>Permisos</Label>
              <div className="mt-1.5 rounded-xl border border-gray-200 p-3 dark:border-neutral-700">
                <PermisosFieldset idPrefix={`edit-admin-${usuario.id_usuario}`} seleccionados={permisos} onToggle={togglePermiso} />
              </div>
            </div>
            <div>
              <Label htmlFor={`edit-admin-password-${usuario.id_usuario}`}>Nueva contraseña (opcional)</Label>
              <Input
                id={`edit-admin-password-${usuario.id_usuario}`}
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
