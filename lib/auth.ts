import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUsuarioByUsername, compararPassword } from "@/lib/db/usuarios";
import { getRolById } from "@/lib/db/roles";
import { resolverSesion } from "@/lib/auth/permisos";
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
        if (!usuario || !usuario.activo) return null;

        const valido = compararPassword(password, usuario.password_hash);
        if (!valido) return null;

        const [rol, sesion] = await Promise.all([getRolById(usuario.id_rol), resolverSesion(usuario)]);

        return {
          id: String(usuario.id_usuario),
          name: usuario.nombre,
          rolId: usuario.id_rol,
          rolNombre: rol?.nombre ?? "",
          permisos: sesion.permisos,
          clubIds: sesion.clubIds,
          clubPrincipalId: sesion.clubPrincipalId,
          idEstudiante: usuario.id_estudiante,
          primerInicioSesion: usuario.primer_inicio_sesion,
        };
      },
    }),
  ],
});
