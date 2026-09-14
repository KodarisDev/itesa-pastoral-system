export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export interface Club {
  id_club: number;
  nombre: string;
  descripcion: string | null;
  capacidad: number | null;
  foto: string | null;
}

export interface Encargado {
  id_encargado: number;
  id_club: number;
  id_usuario: number;
  encargado_principal: boolean;
}

/** Club + lista de encargados resueltos, para pantallas que necesitan mostrarlos juntos. */
export interface ClubConEncargados extends Club {
  encargados: (Encargado & { usuario: { id_usuario: number; nombre: string } })[];
}

/** Configuración global de pastoral (no por club): un único registro con el día y la hora de reunión. */
export interface Configuracion {
  id_configuracion: number;
  dia_club: string | null;
  hora_club: string | null;
  fecha_ultima_promocion: string | null;
}
