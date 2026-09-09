import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUsuarioByUsername } from "@/lib/db/usuarios";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        const usuario = await getUsuarioByUsername(username);
        if (!usuario) return null;

        const valido = bcrypt.compareSync(password, usuario.passwordHash);
        if (!valido) return null;

        return {
          id: usuario.id,
          name: usuario.nombre,
          rol: usuario.rol,
          clubId: usuario.clubId,
          tipoPersona: usuario.tipoPersona,
        };
      },
    }),
  ],
});
