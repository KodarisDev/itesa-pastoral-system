export interface Usuario {
  id_usuario: number;
  id_rol: number;
  id_estudiante: number | null;
  nombre: string;
  usuario: string;
  password_hash: string;
  activo: boolean;
  primer_inicio_sesion: boolean;
}

export type UsuarioPublico = Omit<Usuario, "password_hash">;
