"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Plus } from "lucide-react";
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
import { usuarioAdminSchema } from "@/lib/validations/usuario.schema";
import { createUsuarioAdmin } from "@/lib/actions/users.actions";
import type { Permission } from "@/types";

export function CreateAdminDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [permisos, setPermisos] = useState<Permission[]>([]);
  const [password, setPassword] = useState("");

  function reset() {
    setFieldErrors({});
    setPermisos([]);
    setPassword("");
  }

  function togglePermiso(permiso: Permission, marcado: boolean) {
    setPermisos((prev) => (marcado ? [...prev, permiso] : prev.filter((p) => p !== permiso)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = usuarioAdminSchema.safeParse({
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      password,
      permisos: formData.getAll("permisos"),
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
      const res = await createUsuarioAdmin(formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Administrador "${res.data.username}" creado correctamente.`);
      setOpen(false);
      router.refresh();
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
        <Button>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo administrador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo administrador</DialogTitle>
          <DialogDescription>
            Crea una cuenta con acceso al panel de Pastoral, sin ligarla a un club. Elige exactamente qué puede hacer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label htmlFor="admin-nombre">Nombre completo</Label>
              <Input id="admin-nombre" name="nombre" invalid={!!fieldErrors.nombre} placeholder="Ej. Yudelka Peña" />
              {fieldErrors.nombre && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.nombre}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="admin-username">Usuario</Label>
              <Input id="admin-username" name="username" invalid={!!fieldErrors.username} placeholder="Ej. yudelka.pena" />
              {fieldErrors.username && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="admin-password">Contraseña</Label>
              <Input
                id="admin-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!fieldErrors.password}
                placeholder="Mínimo 6 caracteres"
              />
              {fieldErrors.password && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Compártela de forma segura con el administrador — no se genera ninguna automáticamente.
              </p>
            </div>
            <div>
              <Label>Permisos</Label>
              <div className="mt-1.5 rounded-xl border border-gray-200 p-3 dark:border-neutral-700">
                <PermisosFieldset idPrefix="crear-admin" seleccionados={permisos} onToggle={togglePermiso} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Crear administrador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
