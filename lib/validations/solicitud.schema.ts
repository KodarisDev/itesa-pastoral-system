import { z } from "zod";

export const solicitudSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "Escribe tu nombre completo, por favor.")
      .max(80, "El nombre es demasiado largo."),
    apellido: z
      .string()
      .trim()
      .min(2, "Escribe tu apellido completo, por favor.")
      .max(80, "El apellido es demasiado largo."),
    curso: z
      .string()
      .trim()
      .min(1, "Indica tu curso o grado actual."),
    matricula: z
      .string()
      .trim()
      .min(3, "Tu número de matrícula debe tener al menos 3 caracteres.")
      .max(30, "El número de matrícula parece demasiado largo, verifícalo."),
    clubDeseadoId: z.string().min(1, "Selecciona el club en el que deseas participar."),
    clubAlternativoId: z
      .string()
      .min(1, "Selecciona un club alternativo por si no logras entrar al primero."),
  })
  .refine((data) => data.clubDeseadoId !== data.clubAlternativoId, {
    message: "El club alternativo debe ser diferente al club que deseas.",
    path: ["clubAlternativoId"],
  });

export type SolicitudFormValues = z.infer<typeof solicitudSchema>;
