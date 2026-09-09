import { redirect } from "next/navigation";
import { LayoutDashboard, Shapes, Inbox, GraduationCap, KeyRound, ClipboardCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { DashboardShell, type DashboardNavItem } from "@/components/shared/DashboardShell";

const ICON_CLASS = "h-4 w-4";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Panel general", icon: <LayoutDashboard className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/admin/clubes", label: "Clubes", icon: <Shapes className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/admin/asistencias", label: "Asistencias", icon: <ClipboardCheck className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: <Inbox className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/admin/estudiantes", label: "Estudiantes", icon: <GraduationCap className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/admin/usuarios", label: "Encargados", icon: <KeyRound className={ICON_CLASS} aria-hidden="true" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.rol !== "pastoral") {
    redirect("/login");
  }

  return (
    <DashboardShell title="Pastoral" subtitle="Panel del encargado" navItems={NAV_ITEMS} userName={session.user.name ?? "Encargado"}>
      {children}
    </DashboardShell>
  );
}
