export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string | null;
}

export interface Permiso {
  id_permiso: number;
  id_rol: number;
  permiso: string;
}

/** Catálogo cerrado de permisos — única fuente de verdad de qué strings son válidos. */
export const PERMISOS_CATALOGO = [
  "estudiantes:ver",
  "estudiantes:inscribir",
  "estudiantes:gestionar",
  "estudiantes:promover",
  "clubes:ver",
  "clubes:gestionar",
  "clubes:encargados",
  "asistencia:pasar",
  "asistencia:ver",
  "asistencia:exportar",
  "usuarios:gestionar",
  "roles:gestionar",
  "configuracion:editar",
] as const;

export type Permission = (typeof PERMISOS_CATALOGO)[number];

/**
 * Subconjunto de PERMISOS_CATALOGO que hoy controla algo real en el código
 * (una página o una Server Action) — es lo único que se ofrece para asignar
 * a un administrador en Configuración, agrupado para el checklist de la UI.
 * El resto del catálogo (`clubes:encargados`, `roles:gestionar`,
 * `configuracion:editar`) está reservado para funcionalidad futura.
 */
export const PERMISOS_ASIGNABLES: { permiso: Permission; label: string; grupo: string }[] = [
  { permiso: "estudiantes:ver", label: "Ver el listado de estudiantes", grupo: "Estudiantes" },
  { permiso: "estudiantes:inscribir", label: "Inscribir estudiantes en un club", grupo: "Estudiantes" },
  { permiso: "estudiantes:gestionar", label: "Cambiar o quitar estudiantes de un club", grupo: "Estudiantes" },
  { permiso: "estudiantes:promover", label: "Cargar listado (Excel) de estudiantes nuevos", grupo: "Estudiantes" },
  { permiso: "clubes:ver", label: "Ver el listado de clubes", grupo: "Clubes" },
  { permiso: "clubes:gestionar", label: "Crear, editar y eliminar clubes", grupo: "Clubes" },
  { permiso: "asistencia:ver", label: "Ver los reportes de asistencia", grupo: "Asistencia" },
  { permiso: "asistencia:exportar", label: "Exportar asistencia a Excel", grupo: "Asistencia" },
  { permiso: "usuarios:gestionar", label: "Gestionar encargados y administradores del sistema", grupo: "Sistema" },
];
