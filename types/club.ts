export interface CicloClub {
  numero: number;
  fechaInicio: string; // ISO date
  anioEscolar: string;
}

export interface Club {
  id: string;
  nombre: string;
  descripcion: string;
  fotoUrl: string | null;
  capacidadMaxima: number;
  duracionMeses: number;
  encargadoUsuarioId: string | null;
  cicloActual: CicloClub;
  miembrosActuales: string[]; // Estudiante.id[]
}
