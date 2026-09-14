import { z } from "zod";
import { DIAS_SEMANA } from "@/types";

export const configuracionSchema = z.object({
  diaClub: z.enum(DIAS_SEMANA).optional().or(z.literal("")),
  horaClub: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida, usa formato HH:MM.")
    .optional()
    .or(z.literal("")),
});

export type ConfiguracionFormValues = z.infer<typeof configuracionSchema>;
