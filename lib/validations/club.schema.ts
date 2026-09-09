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
  capacidadMaxima: z.coerce
    .number({ invalid_type_error: "Ingresa un número de cupos válido." })
    .int("El cupo debe ser un número entero.")
    .min(1, "El club debe aceptar al menos 1 estudiante.")
    .max(500, "Ese cupo parece demasiado alto, verifica el número."),
  duracionMeses: z.coerce
    .number({ invalid_type_error: "Ingresa una duración válida en meses." })
    .int("La duración debe ser un número entero de meses.")
    .min(1, "El club debe durar al menos 1 mes.")
    .max(12, "El club no puede durar más de 12 meses."),
  encargadoUsuarioId: z.string().trim().nullable().optional(),
});

export type ClubFormValues = z.infer<typeof clubSchema>;
