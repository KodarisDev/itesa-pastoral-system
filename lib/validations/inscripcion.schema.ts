import { z } from "zod";

export const inscripcionSchema = z.object({
  estudianteId: z.string().min(1, "Selecciona un estudiante."),
  clubId: z.string().min(1, "Selecciona un club."),
});

export type InscripcionFormValues = z.infer<typeof inscripcionSchema>;
