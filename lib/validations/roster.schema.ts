import { z } from "zod";

export const rosterUploadSchema = z.object({
  anioEscolar: z
    .string()
    .trim()
    .min(4, "Indica el año escolar (ej. 2026 o 2026-2027).")
    .max(20, "El año escolar ingresado es demasiado largo."),
});

export type RosterUploadFormValues = z.infer<typeof rosterUploadSchema>;

export const filaExcelSchema = z.object({
  nombre: z.string().trim().min(1),
  apellido: z.string().trim().min(1),
  curso: z.string().trim().min(1),
  matricula: z.string().trim().min(1),
});

export type FilaExcel = z.infer<typeof filaExcelSchema>;
