import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { ClubCard } from "@/components/marca/ClubCard";
import { getConteoMiembrosPorClub } from "@/lib/db/estudiantes";
import { getClubesCached, getConfiguracionCached } from "@/lib/db/cached";
import { formatearHorarioPastoral } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clubes",
  description: "Todos los clubes disponibles de la Pastoral Salesiana del Instituto Técnico Salesiano (ITESA).",
  alternates: { canonical: "/clubes" },
};

export default async function ClubesPage() {
  const [clubes, miembrosPorClub, configuracion] = await Promise.all([
    getClubesCached(),
    getConteoMiembrosPorClub(),
    getConfiguracionCached(),
  ]);
  const horario = formatearHorarioPastoral(configuracion);

  return (
    <main id="contenido" className="bg-white text-neutral-950">
      <Navbar />
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
            Clubes disponibles
          </p>
          <h1 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950">
            Todos los clubes de Pastoral
          </h1>
          <p className="mt-3 text-balance text-sm leading-relaxed text-neutral-500">
            Explora la lista completa de clubes activos este ciclo escolar y su cupo disponible.
          </p>
          {horario && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-600">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Hora de pastoral: {horario}
            </p>
          )}
        </div>

        {clubes.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">Todavía no hay clubes disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clubes.map((club) => (
              <ClubCard key={club.id_club} club={club} miembrosActuales={miembrosPorClub.get(club.id_club) ?? 0} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
