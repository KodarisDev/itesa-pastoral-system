"use client";

import { useState, useTransition } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cambiarPasswordPropiaSchema } from "@/lib/validations/usuario.schema";
import { cambiarPasswordPropia } from "@/lib/actions/perfil.actions";

export function ForcePasswordChangeModal() {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const abierto = session?.user.primerInicioSesion === true;
  if (!abierto) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      password: formData.get("password"),
      confirmarPassword: formData.get("confirmarPassword"),
    };
    const parsed = cambiarPasswordPropiaSchema.safeParse(raw);
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
      await update({ primerInicioSesion: false });
      toast.success("Contraseña actualizada correctamente.");
    });
  }

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400">
              <KeyRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <DialogPrimitive.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Cambia tu contraseña
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Es tu primer inicio de sesión. Debes crear una nueva contraseña antes de continuar.
            </DialogPrimitive.Description>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" invalid={!!error} />
            </div>
            <div>
              <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
              <Input id="confirmarPassword" name="confirmarPassword" type="password" autoComplete="new-password" invalid={!!error} />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Guardar contraseña
            </Button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
