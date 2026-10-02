import { z } from "zod";

export const subclubSchema = z.object({
  clubId: z.number().int().positive(),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre del subclub debe tener al menos 2 caracteres.")
    .max(80, "El nombre del subclub no puede superar los 80 caracteres."),
});

export type SubclubFormValues = z.infer<typeof subclubSchema>;
