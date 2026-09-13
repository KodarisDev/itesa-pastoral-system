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
