import { redirect } from "next/navigation";
import { LayoutDashboard, Shapes, UserPlus, GraduationCap, Settings, ClipboardCheck, ArrowUpCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { tienePermiso } from "@/lib/auth/permisos";
import { DashboardShell, type DashboardNavItem } from "@/components/shared/DashboardShell";
import type { Permission } from "@/types";

const ICON_CLASS = "h-4 w-4";

const NAV_ITEMS: (DashboardNavItem & { permiso?: Permission })[] = [
  { href: "/admin", label: "Panel general", icon: <LayoutDashboard className={ICON_CLASS} aria-hidden="true" /> },
  { href: "/admin/clubes", label: "Clubes", icon: <Shapes className={ICON_CLASS} aria-hidden="true" />, permiso: "clubes:ver" },
  {
    href: "/admin/asistencias",
    label: "Asistencias",
    icon: <ClipboardCheck className={ICON_CLASS} aria-hidden="true" />,
    permiso: "asistencia:ver",
  },
  {
    href: "/admin/inscripcion",
    label: "Inscripción",
    icon: <UserPlus className={ICON_CLASS} aria-hidden="true" />,
    permiso: "estudiantes:inscribir",
  },
  {
    href: "/admin/estudiantes",
    label: "Estudiantes",
    icon: <GraduationCap className={ICON_CLASS} aria-hidden="true" />,
    permiso: "estudiantes:ver",
  },
  {
    href: "/admin/promocion",
    label: "Promoción",
    icon: <ArrowUpCircle className={ICON_CLASS} aria-hidden="true" />,
    permiso: "estudiantes:promover",
  },
  {
    href: "/admin/usuarios",
    label: "Configuración",
    icon: <Settings className={ICON_CLASS} aria-hidden="true" />,
    permiso: "usuarios:gestionar",
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user.rolNombre !== "pastoral" && session.user.rolNombre !== "admin")) {
    redirect("/login");
  }

  const navItems = NAV_ITEMS.filter((item) => !item.permiso || tienePermiso(session.user.permisos, item.permiso)).map(
    ({ permiso: _permiso, ...item }) => item,
  );

  return (
    <DashboardShell title="Pastoral" subtitle="Panel del encargado" navItems={navItems} userName={session.user.name ?? "Encargado"}>
      {children}
    </DashboardShell>
  );
}
