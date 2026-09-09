export type EstadoSolicitud = "pendiente" | "aceptada" | "rechazada";
export type TipoResolucion =
  | "principal"
  | "alternativo"
  | "manual"
  | "sorteo"
  | "automatica";

export interface ResolucionSolicitud {
  tipo: TipoResolucion;
  fecha: string;
  porUsuarioId: string;
}

export interface SolicitudInscripcion {
  id: string;
  fecha: string; // ISO datetime de envío
  nombre: string;
  apellido: string;
  curso: string;
  matricula: string;
  estudianteId?: string; // resuelto si la matrícula coincide con el roster vigente
  clubDeseadoId: string;
  clubAlternativoId: string;
  estado: EstadoSolicitud;
  clubAsignadoId?: string;
  resolucion?: ResolucionSolicitud;
  motivoRechazo?: string;
}
