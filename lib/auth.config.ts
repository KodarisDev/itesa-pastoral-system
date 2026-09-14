import type { NextAuthConfig } from "next-auth";
import type { Permission } from "@/types";

/**
 * Config "edge-safe": sin el Credentials provider (que necesita bcrypt +
 * Supabase, no disponibles en el Edge Runtime del middleware). Solo
 * decodifica/valida el JWT de sesión ya existente. lib/auth.ts extiende esta
 * config añadiendo el provider real para usarse en Server Actions y en el
 * route handler (ambos corren en Node, no en Edge).
 */
const DOCE_HORAS_EN_SEGUNDOS = 60 * 60 * 12;

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: DOCE_HORAS_EN_SEGUNDOS },
  jwt: { maxAge: DOCE_HORAS_EN_SEGUNDOS },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.rolId = user.rolId;
        token.rolNombre = user.rolNombre;
        token.permisos = user.permisos;
        token.clubIds = user.clubIds;
        token.clubPrincipalId = user.clubPrincipalId;
        token.idEstudiante = user.idEstudiante;
        token.primerInicioSesion = user.primerInicioSesion;
      }
      if (trigger === "update" && session && typeof session.primerInicioSesion === "boolean") {
        token.primerInicioSesion = session.primerInicioSesion;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.rolId = token.rolId as number;
      session.user.rolNombre = token.rolNombre as string;
      session.user.permisos = (token.permisos as Permission[] | undefined) ?? [];
      session.user.clubIds = (token.clubIds as number[] | undefined) ?? [];
      session.user.clubPrincipalId = (token.clubPrincipalId as number | null) ?? null;
      session.user.idEstudiante = (token.idEstudiante as number | null) ?? null;
      session.user.primerInicioSesion = (token.primerInicioSesion as boolean | undefined) ?? false;
      return session;
    },
  },
};
