import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { Hero } from "@/components/marca/Hero";
import { PastoralInfo } from "@/components/marca/PastoralInfo";
import { StatsSection } from "@/components/marca/StatsSection";
import { FeaturedClubs } from "@/components/marca/FeaturedClubs";
import { Gallery } from "@/components/marca/Gallery";
import { HowItWorks } from "@/components/marca/HowItWorks";
import { NewsSection } from "@/components/marca/NewsSection";
import { CtaSection } from "@/components/marca/CtaSection";
import { getClubes } from "@/lib/db/clubes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const clubes = await getClubes();

  const totalEstudiantesActivos = clubes.reduce((acc, c) => acc + c.miembrosActuales.length, 0);
  const totalEncargados = new Set(clubes.map((c) => c.encargadoUsuarioId).filter(Boolean)).size;

  return (
    <main id="contenido">
      <Navbar />
      <Hero clubNames={clubes.map((c) => c.nombre)} />
      <PastoralInfo />
      <StatsSection
        totalClubes={clubes.length}
        totalEstudiantesActivos={totalEstudiantesActivos}
        totalEncargados={totalEncargados}
      />
      <FeaturedClubs clubes={clubes} />
      <Gallery />
      <HowItWorks />
      <NewsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
