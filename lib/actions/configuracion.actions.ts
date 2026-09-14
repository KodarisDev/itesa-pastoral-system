"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/db/cached";
import { configuracionSchema } from "@/lib/validations/configuracion.schema";
import { guardarConfiguracion } from "@/lib/db/configuracion";
import { requirePermiso } from "@/lib/auth/guards";
import { actionOk, actionError, type ActionResult } from "./types";

export async function actualizarConfiguracion(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermiso("configuracion:editar");

    const parsed = configuracionSchema.safeParse({
      diaClub: formData.get("diaClub") ?? "",
      horaClub: formData.get("horaClub") ?? "",
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos.");
    }

    await guardarConfiguracion({
      dia_club: parsed.data.diaClub || null,
      hora_club: parsed.data.horaClub || null,
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin");
    revalidatePath("/club");
    revalidatePath("/club/asistencia");
    revalidatePath("/");
    revalidatePath("/clubes");
    revalidateTag(CACHE_TAGS.configuracion);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo guardar la configuración.");
  }
}
