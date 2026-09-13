import { z } from "zod";
import { PERMISOS_ASIGNABLES, type Permission } from "@/types";

const PERMISOS_ASIGNABLES_VALORES = PERMISOS_ASIGNABLES.map((p) => p.permiso) as [Permission, ...Permission[]];

export const usuarioEncargadoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "Escribe el nombre completo del encargado.")
    .max(80, "El nombre es demasiado largo."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(40, "El usuario es demasiado largo.")
    .regex(/^[a-z0-9._-]+$/, "El usuario solo puede tener letras minúsculas, números, puntos, guiones y guiones bajos."),
  idRol: z.coerce.number().int().positive("Selecciona el rol de esta cuenta."),
  clubId: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().positive("Selecciona un club válido.").optional(),
  ),
  principal: z.coerce.boolean().optional(),
  matriculaEstudiante: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
});

export type UsuarioEncargadoFormValues = z.infer<typeof usuarioEncargadoSchema>;

export const usuarioEncargadoUpdateSchema = usuarioEncargadoSchema.extend({
  password: z
    .string()
    .trim()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(72, "La contraseña es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type UsuarioEncargadoUpdateFormValues = z.infer<typeof usuarioEncargadoUpdateSchema>;

export const usuarioAdminSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "Escribe el nombre completo del administrador.")
    .max(80, "El nombre es demasiado largo."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(40, "El usuario es demasiado largo.")
    .regex(/^[a-z0-9._-]+$/, "El usuario solo puede tener letras minúsculas, números, puntos, guiones y guiones bajos."),
  permisos: z.array(z.enum(PERMISOS_ASIGNABLES_VALORES)).default([]),
});

export type UsuarioAdminFormValues = z.infer<typeof usuarioAdminSchema>;

export const usuarioAdminUpdateSchema = usuarioAdminSchema.extend({
  password: z
    .string()
    .trim()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(72, "La contraseña es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type UsuarioAdminUpdateFormValues = z.infer<typeof usuarioAdminUpdateSchema>;
