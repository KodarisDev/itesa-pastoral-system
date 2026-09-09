"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#clubes", label: "Clubes" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#noticias", label: "Noticias" },
  { href: "/inscripcion", label: "Inscripción" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/95 backdrop-blur-sm transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image src="/logo.webp" alt="Logo del instituto" width={54} height={54} className="rounded-full" priority />
            <span className="text-base font-semibold leading-none text-neutral-950 dark:text-white">Pastoral</span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-brand/10 hover:text-brand dark:text-gray-300 xl:px-3.5 xl:text-[13.5px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200"
            >
              Iniciar sesión
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-0 top-[76px] bottom-0 z-40 flex flex-col overflow-y-auto bg-white dark:bg-neutral-950 lg:hidden"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="flex flex-1 flex-col px-6 pt-2">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05, duration: 0.35 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between border-t border-neutral-100 py-4 text-lg font-medium text-neutral-900 dark:border-neutral-800 dark:text-white",
                    )}
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-gray-500" aria-hidden="true" />
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + LINKS.length * 0.05, duration: 0.35 }}
                className="mt-8 border-t border-neutral-100 pb-10 pt-8 dark:border-neutral-800"
              >
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-neutral-950 px-6 py-4 text-center text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
                >
                  Iniciar sesión
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
