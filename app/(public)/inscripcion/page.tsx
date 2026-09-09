import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { InscripcionForm } from "@/components/marca/InscripcionForm";
import { getClubes } from "@/lib/db/clubes";

export const dynamic = "force-dynamic";

export default async function InscripcionPage() {
  const clubes = await getClubes();

  return (
    <main id="contenido">
      <Navbar />
      <section className="px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-flex items-center rounded-full bg-brand/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-brand">
              Formulario de inscripción
            </p>
            <h1 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Inscríbete a un club
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-balance text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
              Completa tus datos y elige el club que deseas. El encargado de pastoral revisará tu solicitud y te
              confirmará tu club asignado.
            </p>
          </div>

          {clubes.length === 0 ? (
            <p className="text-center text-sm text-neutral-500 dark:text-gray-400">
              Todavía no hay clubes disponibles para inscripción. Vuelve a intentarlo más tarde.
            </p>
          ) : (
            <InscripcionForm clubes={clubes} />
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
