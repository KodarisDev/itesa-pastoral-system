import type { Metadata } from "next";
import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { ClubCard } from "@/components/marca/ClubCard";
import { getClubes } from "@/lib/db/clubes";
import { getConteoMiembrosPorClub } from "@/lib/db/estudiantes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clubes — Pastoral ITESA",
  description: "Todos los clubes disponibles del área de Pastoral del Instituto Técnico Salesiano.",
};

export default async function ClubesPage() {
  const [clubes, miembrosPorClub] = await Promise.all([getClubes(), getConteoMiembrosPorClub()]);

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
