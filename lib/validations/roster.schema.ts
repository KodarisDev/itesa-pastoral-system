import { z } from "zod";

export const filaExcelSchema = z.object({
  nombre: z.string().trim().min(1),
  apellido: z.string().trim().min(1),
  curso: z.string().trim().min(1),
  matricula: z.string().trim().min(1),
});

export type FilaExcel = z.infer<typeof filaExcelSchema>;
