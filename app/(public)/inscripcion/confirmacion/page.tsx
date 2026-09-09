import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";

export default function ConfirmacionPage() {
  return (
    <main id="contenido">
      <Navbar />
      <section className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md rounded-3xl border border-neutral-100 bg-white p-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">¡Solicitud enviada!</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
            Tu solicitud fue recibida correctamente. El encargado de pastoral la revisará y te asignará a tu club
            deseado o al alternativo, según el cupo disponible.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
