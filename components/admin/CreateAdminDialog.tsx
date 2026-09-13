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
  const [credenciales, setCredenciales] = useState<{ username: string; password: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  function reset() {
    setFieldErrors({});
    setPermisos([]);
    setCredenciales(null);
    setCopiado(false);
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
      permisos: formData.getAll("permisos"),
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nombre: flat.nombre?.[0] ?? "",
        username: flat.username?.[0] ?? "",
      });
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const res = await createUsuarioAdmin(formData);
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
          Nuevo administrador
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!credenciales ? (
          <>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cuenta creada</DialogTitle>
              <DialogDescription>
                Guarda esta contraseña ahora: no se volverá a mostrar. Compártela de forma segura con el administrador.
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
