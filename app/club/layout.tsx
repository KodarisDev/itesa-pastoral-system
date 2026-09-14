import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LayoutDashboard, ClipboardCheck, Users, History, UserPlus, UserX } from "lucide-react";
import { auth } from "@/lib/auth";
import { DashboardShell, type DashboardNavItem } from "@/components/shared/DashboardShell";
import { SignOutButton } from "@/components/shared/SignOutButton";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ICON_CLASS = "h-4 w-4";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/club", label: "Mi club", icon: <LayoutDashboard className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/club/asistencia", label: "Pasar lista", icon: <ClipboardCheck className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/club/inscripcion", label: "Inscripción", icon: <UserPlus className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/club/miembros", label: "Miembros", icon: <Users className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/club/historial", label: "Historial de asistencia", icon: <History className={ICON_CLASS} aria-hidden="true" /> },
];

export default async function ClubLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.rolNombre !== "encargado_club") {
    redirect("/login");
  }

  const idClub = session.user.clubPrincipalId ?? session.user.clubIds[0];
  if (!idClub) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 transition-colors duration-300 dark:bg-neutral-950">
        <div className="max-w-sm rounded-3xl border border-neutral-100 bg-white p-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <UserX className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-950 dark:text-white">Todavía no tienes un club asignado</h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
            Tu cuenta de encargado existe, pero ningún club te tiene como encargado todavía. Pídele al encargado de
            pastoral que te asigne uno desde Clubes.
          </p>
          <SignOutButton className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200">
            Cerrar sesión
          </SignOutButton>
        </div>
      </main>
    );
  }

  return (
    <DashboardShell title="Mi club" subtitle="Panel del encargado" navItems={NAV_ITEMS} userName={session.user.name ?? "Encargado"}>
      {children}
    </DashboardShell>
  );
}
