import type { DefaultSession } from "next-auth";
import type { Permission } from "@/types";

interface SesionExtra {
  id: string;
  rolId: number;
  rolNombre: string;
  permisos: Permission[];
  clubIds: number[];
  clubPrincipalId: number | null;
  idEstudiante: number | null;
}

declare module "next-auth" {
  interface Session {
    user: SesionExtra & DefaultSession["user"];
  }

  interface User extends SesionExtra {}
}

declare module "next-auth/jwt" {
  interface JWT extends Partial<SesionExtra> {}
}
