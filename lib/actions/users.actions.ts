"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { usuarioEncargadoSchema } from "@/lib/validations/usuario.schema";
import {
  getUsuarioByUsername,
  getUsuarioById,
  saveUsuario,
  deleteUsuario as dbDeleteUsuario,
  hashPassword,
} from "@/lib/db/usuarios";
import { getClubById, saveClub } from "@/lib/db/clubes";
import { generarId, generarPassword } from "@/lib/utils";
import { actionOk, actionError, type ActionResult } from "./types";

async function requirePastoral() {
  const session = await auth();
  if (!session || session.user.rol !== "pastoral") {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  return session;
}

export async function createUsuarioEncargado(formData: FormData): Promise<
  ActionResult<{ username: string; password: string }>
> {
  try {
    await requirePastoral();

    const parsed = usuarioEncargadoSchema.safeParse({
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      tipoPersona: formData.get("tipoPersona"),
      clubId: formData.get("clubId"),
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const existente = await getUsuarioByUsername(parsed.data.username);
    if (existente) {
      return actionError("Ese nombre de usuario ya está en uso, elige otro.");
    }

    const club = await getClubById(parsed.data.clubId);
    if (!club) return actionError("El club seleccionado no existe.");

    const password = generarPassword();
    const id = generarId("usr");

    await saveUsuario({
      id,
      nombre: parsed.data.nombre,
      username: parsed.data.username,
      passwordHash: hashPassword(password),
      rol: "encargado_club",
      tipoPersona: parsed.data.tipoPersona,
      clubId: parsed.data.clubId,
    });

    if (club.encargadoUsuarioId && club.encargadoUsuarioId !== id) {
      const anterior = await getUsuarioById(club.encargadoUsuarioId);
      if (anterior) await saveUsuario({ ...anterior, clubId: undefined });
    }
    await saveClub({ ...club, encargadoUsuarioId: id });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/clubes");
    return actionOk({ username: parsed.data.username, password });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo crear el usuario.");
  }
}

export async function deleteUsuarioEncargado(usuarioId: string): Promise<ActionResult> {
  try {
    await requirePastoral();
    const usuario = await getUsuarioById(usuarioId);
    if (!usuario) return actionError("El usuario no existe.");
    if (usuario.rol !== "encargado_club") {
      return actionError("Solo se pueden eliminar cuentas de encargados de club.");
    }
    if (usuario.clubId) {
      const club = await getClubById(usuario.clubId);
      if (club && club.encargadoUsuarioId === usuario.id) {
        await saveClub({ ...club, encargadoUsuarioId: null });
      }
    }
    await dbDeleteUsuario(usuarioId);
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/clubes");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo eliminar el usuario.");
  }
}

export async function resetPasswordEncargado(usuarioId: string): Promise<ActionResult<{ password: string }>> {
  try {
    await requirePastoral();
    const usuario = await getUsuarioById(usuarioId);
    if (!usuario) return actionError("El usuario no existe.");
    const password = generarPassword();
    await saveUsuario({ ...usuario, passwordHash: hashPassword(password) });
    revalidatePath("/admin/usuarios");
    return actionOk({ password });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña.");
  }
}
