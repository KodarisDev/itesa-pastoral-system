/** Catálogo cerrado de cursos: 3 grados (4to/5to/6to) x 7 secciones (A-G) = 21 cursos reales. */
export const CURSOS = [
  "4A", "4B", "4C", "4D", "4E", "4F", "4G",
  "5A", "5B", "5C", "5D", "5E", "5F", "5G",
  "6A", "6B", "6C", "6D", "6E", "6F", "6G",
] as const;

export type Curso = (typeof CURSOS)[number];

/** Los 7 cursos de 4to — son los únicos que entran por la carga anual (estudiantes nuevos). */
export const CURSOS_CUARTO = CURSOS.filter((c) => c.startsWith("4")) as Curso[];

export function esCurso(valor: string): valor is Curso {
  return (CURSOS as readonly string[]).includes(valor);
}

export interface Estudiante {
  id_estudiante: number;
  id_club: number | null;
  nombre: string;
  apellido: string;
  matricula: string;
  // Suelto a propósito: además de los 21 cursos reales (Curso), un
  // estudiante que egresa de 6to queda con curso "ExAlumno".
  curso: string | null;
  /** Número de orden del estudiante dentro de su curso, tal como viene en el listado oficial (columna "NO."). */
  numero: number | null;
  activo: boolean;
}
