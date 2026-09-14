/**
 * Tipos manuales que reflejan el esquema SQL real (ver el .sql del proyecto).
 * Si el esquema cambia, actualiza este archivo a mano — no se generan
 * automáticamente todavía.
 */
export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id_rol: number;
          nombre: string;
          descripcion: string | null;
          creado_en: string;
        };
        Insert: {
          id_rol?: number;
          nombre: string;
          descripcion?: string | null;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      permisos: {
        Row: {
          id_permiso: number;
          id_rol: number;
          permiso: string;
          creado_en: string;
        };
        Insert: {
          id_permiso?: number;
          id_rol: number;
          permiso: string;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["permisos"]["Insert"]>;
        Relationships: [];
      };
      usuario_permisos: {
        Row: {
          id_usuario_permiso: number;
          id_usuario: number;
          permiso: string;
          creado_en: string;
        };
        Insert: {
          id_usuario_permiso?: number;
          id_usuario: number;
          permiso: string;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usuario_permisos"]["Insert"]>;
        Relationships: [];
      };
      usuarios: {
        Row: {
          id_usuario: number;
          id_rol: number;
          id_estudiante: number | null;
          nombre: string;
          usuario: string;
          password_hash: string;
          activo: boolean;
          creado_en: string;
        };
        Insert: {
          id_usuario?: number;
          id_rol: number;
          id_estudiante?: number | null;
          nombre: string;
          usuario: string;
          password_hash: string;
          activo?: boolean;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usuarios"]["Insert"]>;
        Relationships: [];
      };
      clubes: {
        Row: {
          id_club: number;
          nombre: string;
          descripcion: string | null;
          capacidad: number | null;
          foto: string | null;
          creado_en: string;
        };
        Insert: {
          id_club?: number;
          nombre: string;
          descripcion?: string | null;
          capacidad?: number | null;
          foto?: string | null;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clubes"]["Insert"]>;
        Relationships: [];
      };
      encargados: {
        Row: {
          id_encargado: number;
          id_club: number;
          id_usuario: number;
          encargado_principal: boolean;
          creado_en: string;
        };
        Insert: {
          id_encargado?: number;
          id_club: number;
          id_usuario: number;
          encargado_principal?: boolean;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["encargados"]["Insert"]>;
        Relationships: [];
      };
      estudiantes: {
        Row: {
          id_estudiante: number;
          id_club: number | null;
          nombre: string;
          apellido: string;
          matricula: string;
          // Texto libre a propósito: el catálogo real de 21 cursos (4A..6G) vive
          // en types/estudiante.ts (CURSOS) y se valida en la capa de aplicación.
          curso: string | null;
          numero: number | null;
          activo: boolean;
          creado_en: string;
        };
        Insert: {
          id_estudiante?: number;
          id_club?: number | null;
          nombre: string;
          apellido: string;
          matricula: string;
          curso?: string | null;
          numero?: number | null;
          activo?: boolean;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["estudiantes"]["Insert"]>;
        Relationships: [];
      };
      asistencia: {
        Row: {
          id_asistencia: number;
          id_estudiante: number;
          id_club: number;
          fecha: string;
          estado: "Presente" | "Ausente" | "Tarde" | "Justificado";
          nota: string | null;
          id_usuario: number;
          creado_en: string;
        };
        Insert: {
          id_asistencia?: number;
          id_estudiante: number;
          id_club: number;
          fecha: string;
          estado: "Presente" | "Ausente" | "Tarde" | "Justificado";
          nota?: string | null;
          id_usuario: number;
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["asistencia"]["Insert"]>;
        Relationships: [];
      };
      historial_membresias: {
        Row: {
          id_historial: number;
          id_estudiante: number;
          id_club: number | null;
          club_nombre: string;
          curso: string | null;
          motivo: "promocion" | "egreso" | "manual";
          creado_en: string;
        };
        Insert: {
          id_historial?: number;
          id_estudiante: number;
          id_club?: number | null;
          club_nombre: string;
          curso?: string | null;
          motivo: "promocion" | "egreso" | "manual";
          creado_en?: string;
        };
        Update: Partial<Database["public"]["Tables"]["historial_membresias"]["Insert"]>;
        Relationships: [];
      };
      configuracion: {
        Row: {
          id_configuracion: number;
          dia_club: string | null;
          hora_club: string | null;
          fecha_ultima_promocion: string | null;
        };
        Insert: {
          id_configuracion?: number;
          dia_club?: string | null;
          hora_club?: string | null;
          fecha_ultima_promocion?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["configuracion"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
