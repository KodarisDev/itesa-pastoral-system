"use client";

import { useState, useTransition, type ReactNode } from "react";
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
import { Label } from "@/components/ui/label";
import { cambiarPasswordPropiaSchema } from "@/lib/validations/usuario.schema";
import { cambiarPasswordPropia } from "@/lib/actions/perfil.actions";

export function ChangePasswordDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = cambiarPasswordPropiaSchema.safeParse({
      password: formData.get("password"),
      confirmarPassword: formData.get("confirmarPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa la contraseña ingresada.");
      return;
    }
    setError("");

    startTransition(async () => {
      const res = await cambiarPasswordPropia(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success("Contraseña actualizada correctamente.");
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setError("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar mi contraseña</DialogTitle>
          <DialogDescription>Escribe una nueva contraseña para tu cuenta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label htmlFor="password-propia">Nueva contraseña</Label>
              <Input id="password-propia" name="password" type="password" autoComplete="new-password" invalid={!!error} />
            </div>
            <div>
              <Label htmlFor="confirmarPassword-propia">Confirmar contraseña</Label>
              <Input id="confirmarPassword-propia" name="confirmarPassword" type="password" autoComplete="new-password" invalid={!!error} />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Guardar contraseña
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
