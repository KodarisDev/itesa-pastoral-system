import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 transition-colors duration-300 dark:bg-neutral-950">
      <div className="max-w-sm rounded-3xl border border-neutral-100 bg-white p-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-950 dark:text-white">No tienes acceso a esta sección</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
          Tu cuenta no tiene permiso para ver esta página. Si crees que es un error, contacta al encargado de
          pastoral.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </main>
  );
}
