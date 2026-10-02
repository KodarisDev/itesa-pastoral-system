import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUsuarioByUsername, compararPassword } from "@/lib/db/usuarios";
import { getRolById } from "@/lib/db/roles";
import { resolverSesion } from "@/lib/auth/permisos";
import { authConfig } from "@/lib/auth.config";
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure } from "@/lib/security/rate-limit";
import { registrarBitacora } from "@/lib/audit";

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
          await registrarBitacora({
            session: null,
            accion: "sesion.login_fallido",
            entidad: "sesion",
            descripcion: `Intento de login fallido para "${usernameNormalizado}" (usuario inexistente o inactivo).`,
            ip,
          });
          return null;
        }

        const valido = compararPassword(password, usuario.password_hash);
        if (!valido) {
          recordLoginFailure(ip, usernameNormalizado);
          await registrarBitacora({
            session: { user: { id: usuario.id_usuario, name: usuario.nombre } },
            accion: "sesion.login_fallido",
            entidad: "sesion",
            descripcion: `Intento de login fallido para "${usernameNormalizado}" (contraseña incorrecta).`,
            ip,
          });
          return null;
        }

        clearLoginFailures(ip, usernameNormalizado);

        const [rol, sesion] = await Promise.all([getRolById(usuario.id_rol), resolverSesion(usuario)]);

        await registrarBitacora({
          session: { user: { id: usuario.id_usuario, name: usuario.nombre } },
          accion: "sesion.login",
          entidad: "sesion",
          descripcion: `${usuario.nombre} inició sesión.`,
          ip,
        });

        return {
          id: String(usuario.id_usuario),
          name: usuario.nombre,
          rolId: usuario.id_rol,
          rolNombre: rol?.nombre ?? "",
          permisos: sesion.permisos,
          clubIds: sesion.clubIds,
          clubGeneralIds: sesion.clubGeneralIds,
          subclubIds: sesion.subclubIds,
          clubPrincipalId: sesion.clubPrincipalId,
          idEstudiante: usuario.id_estudiante,
          primerInicioSesion: usuario.primer_inicio_sesion,
        };
      },
    }),
  ],
  events: {
    async signOut(message) {
      // Con estrategia "jwt", el evento llega con el token (no con la sesión) —
      // ya no tiene los campos de sesión, pero conserva `sub` (id) y `name`.
      const token = "token" in message ? message.token : null;
      if (!token?.sub) return;
      await registrarBitacora({
        session: { user: { id: token.sub, name: token.name ?? null } },
        accion: "sesion.logout",
        entidad: "sesion",
        descripcion: `${token.name ?? "Un usuario"} cerró sesión.`,
      });
    },
  },
});
