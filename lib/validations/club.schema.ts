import { z } from "zod";

export const clubSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre del club debe tener al menos 3 caracteres.")
    .max(80, "El nombre del club no puede superar los 80 caracteres."),
  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres para explicar de qué trata el club.")
    .max(600, "La descripción no puede superar los 600 caracteres."),
  capacidad: z.coerce
    .number({ invalid_type_error: "Ingresa un número de cupos válido." })
    .int("El cupo debe ser un número entero.")
    .min(1, "El club debe aceptar al menos 1 estudiante.")
    .max(500, "Ese cupo parece demasiado alto, verifica el número."),
  // Elegir encargado al crear/editar el club es opcional — se puede asignar
  // después desde Encargados.
  encargadoPrincipalId: z.coerce.number().int().positive().nullable().optional(),
  encargadoSecundarioId: z.coerce.number().int().positive().nullable().optional(),
}).refine((v) => !v.encargadoPrincipalId || !v.encargadoSecundarioId || v.encargadoPrincipalId !== v.encargadoSecundarioId, {
  message: "El encargado secundario debe ser distinto del principal.",
  path: ["encargadoSecundarioId"],
});

export type ClubFormValues = z.infer<typeof clubSchema>;
