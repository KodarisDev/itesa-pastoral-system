import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUsuarioByUsername, compararPassword } from "@/lib/db/usuarios";
import { getRolById } from "@/lib/db/roles";
import { resolverSesion } from "@/lib/auth/permisos";
import { authConfig } from "@/lib/auth.config";
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure } from "@/lib/security/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, request) {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }
        if (username.length > 40 || password.length > 72) return null;

        const usernameNormalizado = username.trim().toLowerCase();
        const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
        if (!checkLoginRateLimit(ip, usernameNormalizado)) {
          throw new Error("Demasiados intentos. Espera unos minutos antes de volver a intentar.");
        }

        const usuario = await getUsuarioByUsername(usernameNormalizado);
        if (!usuario || !usuario.activo) {
          recordLoginFailure(ip, usernameNormalizado);
          return null;
        }

        const valido = compararPassword(password, usuario.password_hash);
        if (!valido) {
          recordLoginFailure(ip, usernameNormalizado);
          return null;
        }

        clearLoginFailures(ip, usernameNormalizado);

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
