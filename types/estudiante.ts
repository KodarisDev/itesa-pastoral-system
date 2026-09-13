export type Curso = "4to" | "5to" | "6to";

export interface Estudiante {
  id_estudiante: number;
  id_club: number | null;
  nombre: string;
  apellido: string;
  matricula: string;
  curso: Curso | null;
  activo: boolean;
}
