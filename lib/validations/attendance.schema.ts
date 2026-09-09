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
      }),
    )
    .min(1, "El club no tiene miembros para pasar lista."),
});

export type AsistenciaFormValues = z.infer<typeof asistenciaSchema>;
