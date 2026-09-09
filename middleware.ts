import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Usa la config edge-safe (sin el Credentials provider) para poder correr en el
// Edge Runtime del middleware — ver lib/auth.config.ts.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const rol = req.auth?.user?.rol;
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && rol !== "pastoral") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/club") && rol !== "encargado_club") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/club/:path*"],
};
