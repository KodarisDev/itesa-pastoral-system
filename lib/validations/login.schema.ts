import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Ingresa tu usuario.").max(40, "El usuario es demasiado largo."),
  password: z.string().min(1, "Ingresa tu contraseña.").max(72, "La contraseña es demasiado larga."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
