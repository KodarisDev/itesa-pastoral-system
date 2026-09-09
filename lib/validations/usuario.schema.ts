import { z } from "zod";

export const usuarioEncargadoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "Escribe el nombre completo del encargado.")
    .max(80, "El nombre es demasiado largo."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(40, "El usuario es demasiado largo.")
    .regex(/^[a-z0-9._-]+$/, "El usuario solo puede tener letras minúsculas, números, puntos, guiones y guiones bajos."),
  tipoPersona: z.enum(["estudiante", "profesor"], {
    errorMap: () => ({ message: "Selecciona si el encargado es estudiante o profesor." }),
  }),
  clubId: z.string().min(1, "Selecciona el club que va a dirigir este encargado."),
});

export type UsuarioEncargadoFormValues = z.infer<typeof usuarioEncargadoSchema>;
