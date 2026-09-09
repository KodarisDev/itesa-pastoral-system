export type Rol = "pastoral" | "encargado_club";
export type TipoPersona = "estudiante" | "profesor";

export interface Usuario {
  id: string;
  nombre: string;
  username: string;
  passwordHash: string;
  rol: Rol;
  tipoPersona?: TipoPersona; // solo si rol === "encargado_club"
  clubId?: string; // solo si rol === "encargado_club"
}

export type UsuarioPublico = Omit<Usuario, "passwordHash">;
