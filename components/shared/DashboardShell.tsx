"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, LogOut, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  href: string;
  label: string;
  // Ícono ya renderizado como elemento (no la referencia al componente): los
  // componentes de ícono de lucide-react son funciones, y las funciones no se
  // pueden pasar como prop de un Server Component a un Client Component — solo
  // elementos React ya instanciados cruzan ese límite.
  icon: ReactNode;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  userName: string;
  children: React.ReactNode;
}

const BRAND_GRADIENT = "linear-gradient(135deg, #c0392b, #922b21)";

export function DashboardShell({ title, subtitle, navItems, userName, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" || href === "/club" ? pathname === href : pathname.startsWith(href));

  const navLinks = (onNavigate?: () => void) =>
    navItems.map((item) => {
      const active = isActive(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
            active
              ? "text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-gray-200",
          )}
          style={active ? { background: BRAND_GRADIENT } : undefined}
        >
          {item.icon}
          {item.label}
        </Link>
      );
    });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 transition-colors duration-300 dark:bg-neutral-950">
      {/* Sidebar de escritorio */}
      <aside className="hidden w-52 min-w-52 flex-col border-r border-gray-100 bg-white py-5 px-3 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900 min-[850px]:flex">
        <div className="mb-5 flex items-center gap-2.5 px-2">
          <Image src="/logo.webp" alt="Logo del instituto" width={32} height={32} className="h-8 w-8 rounded-xl" />
          <div>
            <p className="text-sm font-medium leading-tight tracking-tight text-gray-900 dark:text-white">{title}</p>
            {subtitle && <p className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">{navLinks()}</nav>
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 min-[850px]:hidden">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white py-5 px-3 dark:bg-neutral-900">
            <div className="mb-5 flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.webp" alt="Logo del instituto" width={32} height={32} className="h-8 w-8 rounded-xl" />
                <div>
                  <p className="text-sm font-medium leading-tight tracking-tight text-gray-900 dark:text-white">{title}</p>
                  {subtitle && <p className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</p>}
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">{navLinks(() => setMobileOpen(false))}</nav>
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-[64px] flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900 lg:px-6">
          <div className="flex items-center gap-3 min-[850px]:hidden">
            <Image src="/logo.webp" alt="Logo del instituto" width={28} height={28} className="h-7 w-7 rounded-xl" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
          </div>
          <span className="hidden text-sm text-gray-500 dark:text-gray-400 min-[850px]:inline">
            Sesión: <span className="font-medium text-gray-800 dark:text-gray-200">{userName}</span>
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-800 min-[850px]:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
