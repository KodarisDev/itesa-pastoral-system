import Image from "next/image";
import Link from "next/link";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#clubes", label: "Clubes" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#noticias", label: "Noticias" },
];

const ACCESOS = [
  { href: "/inscripcion", label: "Inscripción a clubes" },
  { href: "/login", label: "Acceso de encargados" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-100 bg-neutral-50 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.webp" alt="Logo del instituto" width={36} height={36} className="rounded-full" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
              Área de Pastoral
              <span className="block text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:text-gray-400">
                Instituto Técnico Salesiano
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
            Acompañamos a cada estudiante en un club durante la hora curricular, formando talento, valores y sentido
            de comunidad más allá del aula.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-gray-500">
            Enlaces
          </h3>
          <ul className="mt-4 space-y-2.5">
            {ENLACES.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-neutral-600 transition-colors hover:text-brand dark:text-gray-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-gray-500">
            Acceso
          </h3>
          <ul className="mt-4 space-y-2.5">
            {ACCESOS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-neutral-600 transition-colors hover:text-brand dark:text-gray-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-neutral-500 dark:text-gray-400">
            Sesiones cada miércoles,
            <br />
            durante la hora curricular.
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800">
        <div className="mx-auto max-w-[1440px] px-4 py-6 text-center text-xs text-neutral-400 dark:text-gray-500 sm:px-6 lg:px-8">
          © {year} Instituto Técnico Salesiano — Área de Pastoral. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
