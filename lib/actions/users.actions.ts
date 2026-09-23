"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/db/cached";
import {
  usuarioEncargadoSchema,
  usuarioEncargadoUpdateSchema,
  usuarioAdminSchema,
  usuarioAdminUpdateSchema,
} from "@/lib/validations/usuario.schema";
import {
  getUsuarioByUsername,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario as dbEliminarUsuario,
  hashPassword,
} from "@/lib/db/usuarios";
import { getClubById, agregarEncargado, quitarEncargado, getClubesDeUsuario } from "@/lib/db/clubes";
import { getEstudianteByMatricula, actualizarEstudiante } from "@/lib/db/estudiantes";
import { getRoles, guardarPermisosDeUsuario } from "@/lib/db/roles";
import { requirePermiso } from "@/lib/auth/guards";
import { actionOk, actionError, type ActionResult } from "./types";

const FORMATO_MATRICULA = /^\d{4}-\d{4}$/;

/** Busca un estudiante por matrícula para autocompletar su nombre al crear/editar un encargado-estudiante. */
export async function buscarEstudianteParaEncargado(
  matricula: string,
): Promise<ActionResult<{ nombre: string; apellido: string } | null>> {
  try {
    await requirePermiso("usuarios:gestionar");
    const limpia = matricula.trim();
    if (!FORMATO_MATRICULA.test(limpia)) {
      return actionOk(null);
    }
    const estudiante = await getEstudianteByMatricula(limpia);
    if (!estudiante) return actionOk(null);
    return actionOk({ nombre: estudiante.nombre, apellido: estudiante.apellido });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo buscar la matrícula.");
  }
}

export async function createUsuarioEncargado(formData: FormData): Promise<ActionResult<{ username: string }>> {
  try {
    await requirePermiso("usuarios:gestionar");

    const parsed = usuarioEncargadoSchema.safeParse({
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      password: formData.get("password"),
      idRol: formData.get("idRol"),
      clubId: formData.get("clubId"),
      principal: formData.get("principal") === "true",
      matriculaEstudiante: formData.get("matriculaEstudiante") ?? "",
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const roles = await getRoles();
    const rolEncargado = roles.find((rol) => rol.nombre === "encargado_club");
    if (!rolEncargado || parsed.data.idRol !== rolEncargado.id_rol) {
      return actionError("Solo se pueden crear cuentas con el rol de encargado de club.");
    }

    const existente = await getUsuarioByUsername(parsed.data.username);
    if (existente) {
      return actionError("Ese nombre de usuario ya está en uso, elige otro.");
    }

    if (parsed.data.clubId) {
      const club = await getClubById(parsed.data.clubId);
      if (!club) return actionError("El club seleccionado no existe.");
    }

    let idEstudiante: number | null = null;
    if (parsed.data.matriculaEstudiante) {
      const estudiante = await getEstudianteByMatricula(parsed.data.matriculaEstudiante);
      if (!estudiante) return actionError("No se encontró ningún estudiante con esa matrícula.");
      idEstudiante = estudiante.id_estudiante;
    }

    const usuario = await crearUsuario({
      id_rol: parsed.data.idRol,
      id_estudiante: idEstudiante,
      nombre: parsed.data.nombre,
      usuario: parsed.data.username,
      password_hash: hashPassword(parsed.data.password),
      activo: true,
      primer_inicio_sesion: true,
    });

    // El club es opcional al crear: puede asignarse después desde Editar.
    if (parsed.data.clubId) {
      await agregarEncargado(parsed.data.clubId, usuario.id_usuario, !!parsed.data.principal);
    }

    // El estudiante-encargado pertenece a su propio club (no se agrega aparte).
    if (idEstudiante && parsed.data.clubId) {
      await actualizarEstudiante(idEstudiante, { id_club: parsed.data.clubId });
    }

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/clubes");
    revalidatePath("/admin/estudiantes");
    revalidateTag(CACHE_TAGS.usuarios);
    revalidateTag(CACHE_TAGS.clubes);
    revalidateTag(CACHE_TAGS.estudiantes);
    return actionOk({ username: parsed.data.username });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo crear el usuario.");
  }
}

export async function updateUsuarioEncargado(usuarioId: number, formData: FormData): Promise<ActionResult> {
  try {
    await requirePermiso("usuarios:gestionar");

    const usuario = await getUsuarioById(usuarioId);
    if (!usuario) return actionError("El usuario no existe.");

    const parsed = usuarioEncargadoUpdateSchema.safeParse({
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      idRol: formData.get("idRol"),
      clubId: formData.get("clubId"),
      principal: formData.get("principal") === "true",
      matriculaEstudiante: formData.get("matriculaEstudiante") ?? "",
      password: formData.get("password") ?? "",
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const roles = await getRoles();
    const rolEncargado = roles.find((rol) => rol.nombre === "encargado_club");
    if (!rolEncargado || parsed.data.idRol !== rolEncargado.id_rol) {
      return actionError("Solo se pueden editar cuentas con el rol de encargado de club.");
    }

    const existente = await getUsuarioByUsername(parsed.data.username);
    if (existente && existente.id_usuario !== usuarioId) {
      return actionError("Ese nombre de usuario ya está en uso, elige otro.");
    }

    if (parsed.data.clubId) {
      const clubNuevo = await getClubById(parsed.data.clubId);
      if (!clubNuevo) return actionError("El club seleccionado no existe.");
    }

    let idEstudiante = usuario.id_estudiante;
    if (parsed.data.matriculaEstudiante) {
      const estudiante = await getEstudianteByMatricula(parsed.data.matriculaEstudiante);
      if (!estudiante) return actionError("No se encontró ningún estudiante con esa matrícula.");
      idEstudiante = estudiante.id_estudiante;
    } else {
      idEstudiante = null;
    }

    // Si se le quita el club por completo (queda "sin asignar"), deja de ser
    // encargado de algo y se desactiva la cuenta; si se le asigna un club
    // (nuevo o de vuelta), se reactiva.
    const clubesActuales = await getClubesDeUsuario(usuarioId);
    const teniaClub = clubesActuales.length > 0;
    const activo = parsed.data.clubId ? true : teniaClub ? false : usuario.activo;

    await actualizarUsuario(usuarioId, {
      nombre: parsed.data.nombre,
      usuario: parsed.data.username,
      id_rol: parsed.data.idRol,
      id_estudiante: idEstudiante,
      activo,
      password_hash: parsed.data.password ? hashPassword(parsed.data.password) : usuario.password_hash,
      ...(parsed.data.password ? { primer_inicio_sesion: true } : {}),
    });

    // Sin club nuevo: se quita de cualquier club que dirigiera (queda "sin asignar").
    for (const encargo of clubesActuales) {
      if (encargo.id_club !== parsed.data.clubId) await quitarEncargado(encargo.id_club, usuarioId);
    }
    if (parsed.data.clubId) {
      const yaEnClubNuevo = clubesActuales.some((e) => e.id_club === parsed.data.clubId);
      if (!yaEnClubNuevo) {
        await agregarEncargado(parsed.data.clubId, usuarioId, !!parsed.data.principal);
      }
    }

    if (idEstudiante) {
      await actualizarEstudiante(idEstudiante, { id_club: parsed.data.clubId ?? null });
    }

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/clubes");
    revalidatePath("/admin/estudiantes");
    revalidateTag(CACHE_TAGS.usuarios);
    revalidateTag(CACHE_TAGS.clubes);
    revalidateTag(CACHE_TAGS.estudiantes);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo actualizar el usuario.");
  }
}

export async function deleteUsuarioEncargado(usuarioId: number): Promise<ActionResult> {
  try {
    await requirePermiso("usuarios:gestionar");
    const usuario = await getUsuarioById(usuarioId);
    if (!usuario) return actionError("El usuario no existe.");

    if (usuario.id_estudiante) {
      await actualizarEstudiante(usuario.id_estudiante, { id_club: null });
    }
    await dbEliminarUsuario(usuarioId);
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/clubes");
    revalidatePath("/admin/estudiantes");
    revalidateTag(CACHE_TAGS.usuarios);
    revalidateTag(CACHE_TAGS.clubes);
    revalidateTag(CACHE_TAGS.estudiantes);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo eliminar el usuario.");
  }
}

async function idRolAdmin(): Promise<number> {
  const roles = await getRoles();
  const id = roles.find((r) => r.nombre === "admin")?.id_rol;
  if (!id) throw new Error('El rol "admin" no existe todavía en la base de datos.');
  return id;
}

export async function createUsuarioAdmin(formData: FormData): Promise<ActionResult<{ username: string }>> {
  try {
    await requirePermiso("usuarios:gestionar");

    const parsed = usuarioAdminSchema.safeParse({
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      password: formData.get("password"),
      permisos: formData.getAll("permisos"),
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const existente = await getUsuarioByUsername(parsed.data.username);
    if (existente) {
      return actionError("Ese nombre de usuario ya está en uso, elige otro.");
    }

    const usuario = await crearUsuario({
      id_rol: await idRolAdmin(),
      id_estudiante: null,
      nombre: parsed.data.nombre,
      usuario: parsed.data.username,
      password_hash: hashPassword(parsed.data.password),
      activo: true,
      primer_inicio_sesion: true,
    });
    await guardarPermisosDeUsuario(usuario.id_usuario, parsed.data.permisos);

    revalidatePath("/admin/usuarios");
    revalidateTag(CACHE_TAGS.usuarios);
    return actionOk({ username: parsed.data.username });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo crear el administrador.");
  }
}

export async function updateUsuarioAdmin(usuarioId: number, formData: FormData): Promise<ActionResult> {
  try {
    await requirePermiso("usuarios:gestionar");

    const usuario = await getUsuarioById(usuarioId);
    if (!usuario) return actionError("El usuario no existe.");

    const parsed = usuarioAdminUpdateSchema.safeParse({
      nombre: formData.get("nombre"),
      username: formData.get("username"),
      permisos: formData.getAll("permisos"),
      password: formData.get("password") ?? "",
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
    }

    const existente = await getUsuarioByUsername(parsed.data.username);
    if (existente && existente.id_usuario !== usuarioId) {
      return actionError("Ese nombre de usuario ya está en uso, elige otro.");
    }

    await actualizarUsuario(usuarioId, {
      nombre: parsed.data.nombre,
      usuario: parsed.data.username,
      password_hash: parsed.data.password ? hashPassword(parsed.data.password) : usuario.password_hash,
      ...(parsed.data.password ? { primer_inicio_sesion: true } : {}),
    });
    await guardarPermisosDeUsuario(usuarioId, parsed.data.permisos);

    revalidatePath("/admin/usuarios");
    revalidateTag(CACHE_TAGS.usuarios);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "No se pudo actualizar el administrador.");
  }
}
