import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe": sin el Credentials provider (que necesita fs/bcrypt para leer
 * usuarios.json, no disponible en el Edge Runtime del middleware). Solo decodifica/valida
 * el JWT de sesión ya existente. lib/auth.ts extiende esta config añadiendo el provider real
 * para usarse en Server Actions y en el route handler (ambos corren en Node, no en Edge).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.clubId = user.clubId;
        token.tipoPersona = user.tipoPersona;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.rol = token.rol as typeof session.user.rol;
      session.user.clubId = token.clubId as string | undefined;
      session.user.tipoPersona = token.tipoPersona as typeof session.user.tipoPersona;
      return session;
    },
  },
};
