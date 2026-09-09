import type { DefaultSession } from "next-auth";
import type { Rol, TipoPersona } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: Rol;
      clubId?: string;
      tipoPersona?: TipoPersona;
    } & DefaultSession["user"];
  }

  interface User {
    rol: Rol;
    clubId?: string;
    tipoPersona?: TipoPersona;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: Rol;
    clubId?: string;
    tipoPersona?: TipoPersona;
  }
}
