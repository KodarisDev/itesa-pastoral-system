import { redirect } from "next/navigation";
import { LayoutDashboard, ClipboardCheck, Users, History } from "lucide-react";
import { auth } from "@/lib/auth";
import { DashboardShell, type DashboardNavItem } from "@/components/shared/DashboardShell";

const ICON_CLASS = "h-4 w-4";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/club", label: "Mi club", icon: <LayoutDashboard className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/club/asistencia", label: "Pasar lista", icon: <ClipboardCheck className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/club/miembros", label: "Miembros", icon: <Users className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/club/historial", label: "Historial de asistencia", icon: <History className={ICON_CLASS} aria-hidden="true" /> },
];

export default async function ClubLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.rol !== "encargado_club") {
    redirect("/login");
  }

  return (
    <DashboardShell title="Mi club" subtitle="Panel del encargado" navItems={NAV_ITEMS} userName={session.user.name ?? "Encargado"}>
      {children}
    </DashboardShell>
  );
}
