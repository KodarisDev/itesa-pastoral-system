import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/marca/LoginForm";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-16 transition-colors duration-300 dark:bg-neutral-950">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo.webp" alt="Logo del instituto" width={48} height={48} className="mb-4 rounded-full" />
          <h1 className="text-xl font-semibold text-neutral-950 dark:text-white">Acceso de encargados</h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-gray-400">
            Inicia sesión con el usuario que te proporcionó el encargado de pastoral.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-neutral-400 dark:text-gray-500">
          <Link href="/" className="hover:text-brand">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
