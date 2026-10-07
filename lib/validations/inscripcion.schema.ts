import { z } from "zod";

export const inscripcionSchema = z.object({
  estudianteId: z.coerce.number().int().positive("Selecciona un estudiante."),
  clubId: z.coerce.number().int().positive("Selecciona un club."),
  subclubId: z.coerce.number().int().positive().nullish(),
});

export type InscripcionFormValues = z.infer<typeof inscripcionSchema>;
