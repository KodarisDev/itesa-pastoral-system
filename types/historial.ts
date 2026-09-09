export type MotivoArchivo = "nuevo_ciclo" | "nuevo_anio_escolar";

export interface HistorialClub {
  id: string;
  estudianteId: string;
  clubId: string;
  clubNombre: string; // snapshot, por si el club se renombra/elimina luego
  anioEscolar: string;
  cicloNumero: number;
  fechaInicio: string;
  fechaFin: string;
  motivoArchivo: MotivoArchivo;
}
