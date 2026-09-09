import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { ShareButtons } from "@/components/marca/ShareButtons";
import { BackToTopButton } from "@/components/marca/BackToTopButton";
import { NOTICIAS, getNoticiaBySlug } from "@/content/noticias";

interface NoticiaPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return NOTICIAS.map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: NoticiaPageProps): Metadata {
  const noticia = getNoticiaBySlug(params.slug);
  if (!noticia) return {};
  return {
    title: `${noticia.titulo} — Pastoral ITESA`,
    description: noticia.resumen,
  };
}

export default function NoticiaPage({ params }: NoticiaPageProps) {
  const noticia = getNoticiaBySlug(params.slug);
  if (!noticia) notFound();

  const relacionadas = NOTICIAS.filter((n) => n.slug !== noticia.slug).slice(0, 2);

  return (
    <main id="contenido">
      <Navbar />

      <article className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <nav
            aria-label="Ruta de navegación"
            className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-gray-400"
          >
            <Link href="/" className="hover:text-brand">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/#noticias" className="hover:text-brand">
              Noticias
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </nav>

          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-brand">
            <span>{noticia.categoria}</span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-neutral-400 dark:text-gray-500">{noticia.fecha}</span>
          </div>
          <h1 className="text-balance text-[clamp(28px,4.5vw,44px)] font-bold leading-[1.1] tracking-tight text-neutral-950 dark:text-white">
            {noticia.titulo}
          </h1>

          <div
            className="relative mt-8 flex aspect-[21/9] items-center justify-center overflow-hidden rounded-3xl"
            style={{ background: "linear-gradient(135deg, #c0392b 0%, #922b21 55%, #7f0000 100%)" }}
          >
            <noticia.icono className="h-16 w-16 text-white/40" aria-hidden="true" strokeWidth={1.1} />
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-10 lg:grid-cols-[1fr_220px]">
          <div className="min-w-0 space-y-5">
            {noticia.cuerpo.map((parrafo, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-neutral-600 dark:text-gray-300">
                {parrafo}
              </p>
            ))}

            {noticia.cta && (
              <div className="pt-2">
                <Link
                  href={noticia.cta.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {noticia.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <ShareButtons titulo={noticia.titulo} />
          </aside>
        </div>
      </article>

      {relacionadas.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pb-24 pt-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-t border-neutral-100 pt-10 dark:border-neutral-800">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-gray-500">
                Sigue leyendo
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                Noticias que también te pueden interesar
              </h2>
            </div>
            <Link
              href="/#noticias"
              className="hidden shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-gray-300 sm:inline-flex"
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {relacionadas.map((n) => (
              <article
                key={n.slug}
                className="flex flex-col overflow-hidden rounded-3xl border border-neutral-100 dark:border-neutral-800"
              >
                <Link
                  href={`/noticias/${n.slug}`}
                  className="relative flex aspect-[16/9] items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(ellipse 100% 80% at 30% 20%, color-mix(in srgb, var(--brand-accent) 18%, transparent), transparent), #fafafa",
                  }}
                >
                  <n.icono className="h-9 w-9 text-brand/50" aria-hidden="true" strokeWidth={1.25} />
                </Link>
                <div className="p-5">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-gray-500">
                    {n.fecha}
                  </p>
                  <h3 className="text-[15px] font-semibold leading-snug text-neutral-950 dark:text-white">
                    <Link href={`/noticias/${n.slug}`} className="hover:underline">
                      {n.titulo}
                    </Link>
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500 dark:text-gray-400">{n.resumen}</p>
                  <Link
                    href={`/noticias/${n.slug}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
                  >
                    Leer más
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <BackToTopButton />
    </main>
  );
}
