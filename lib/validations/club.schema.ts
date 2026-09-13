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
  encargadoPrincipalId: z.coerce.number().int().positive().nullable().optional(),
});

export type ClubFormValues = z.infer<typeof clubSchema>;

/** Un club nuevo debe nacer con un encargado — no se puede crear "huérfano". */
export const clubCreateSchema = clubSchema.extend({
  encargadoPrincipalId: z.coerce.number().int().positive("Selecciona quién va a dirigir este club."),
});

export type ClubCreateFormValues = z.infer<typeof clubCreateSchema>;
