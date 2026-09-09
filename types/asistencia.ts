export interface RegistroPresencia {
  estudianteId: string;
  presente: boolean;
  justificacion?: string;
}

export interface SesionAsistencia {
  id: string;
  clubId: string;
  fecha: string; // ISO date (día en que se pasó lista)
  registros: RegistroPresencia[];
  tomadaPorUsuarioId: string;
  anioEscolar: string;
}
