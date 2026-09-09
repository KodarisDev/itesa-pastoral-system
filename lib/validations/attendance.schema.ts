import { z } from "zod";

export const asistenciaSchema = z.object({
  clubId: z.string().min(1),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),
  registros: z
    .array(
      z.object({
        estudianteId: z.string().min(1),
        presente: z.boolean(),
        justificacion: z.string().trim().max(240, "La justificación no puede pasar de 240 caracteres.").optional(),
      }),
    )
    .min(1, "El club no tiene miembros para pasar lista."),
});

export type AsistenciaFormValues = z.infer<typeof asistenciaSchema>;
