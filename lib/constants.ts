export const ROLES = {
  PASTORAL: "pastoral",
  ENCARGADO_CLUB: "encargado_club",
} as const;

export const ESTADOS_SOLICITUD = {
  PENDIENTE: "pendiente",
  ACEPTADA: "aceptada",
  RECHAZADA: "rechazada",
} as const;

export const ESTADO_SOLICITUD_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

export const TIPO_RESOLUCION_LABEL: Record<string, string> = {
  principal: "Club principal",
  alternativo: "Club alternativo",
  manual: "Asignación manual",
  sorteo: "Sorteo",
  automatica: "Asignación automática",
};

export const TIPO_PERSONA_LABEL: Record<string, string> = {
  estudiante: "Estudiante",
  profesor: "Profesor",
};

export const MAX_FOTO_CLUB_BYTES = 2 * 1024 * 1024; // 2MB
export const TIPOS_FOTO_CLUB_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
