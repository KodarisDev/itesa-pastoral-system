"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { cambiarPasswordPropiaSchema } from "@/lib/validations/usuario.schema";
import { actualizarUsuario, hashPassword } from "@/lib/db/usuarios";
import { CACHE_TAGS } from "@/lib/db/cached";
import { registrarBitacora } from "@/lib/audit";
import { actionOk, actionError, type ActionResult } from "./types";

export async function cambiarPasswordPropia(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session) return actionError("Tu sesión expiró, inicia sesión de nuevo.");

    const parsed = cambiarPasswordPropiaSchema.safeParse({
      password: formData.get("password"),
      confirmarPassword: formData.get("confirmarPassword"),
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa la contraseña ingresada.");
    }

    await actualizarUsuario(Number(session.user.id), {
      password_hash: hashPassword(parsed.data.password),
      primer_inicio_sesion: false,
    });

    await registrarBitacora({
      session,
      accion: "usuario.cambiar_password_propia",
      entidad: "usuario",
      entidadId: session.user.id,
      descripcion: `${session.user.name ?? "Un usuario"} cambió su propia contraseña.`,
    });

    revalidateTag(CACHE_TAGS.usuarios);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
  }
}
