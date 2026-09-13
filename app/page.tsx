import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { Hero } from "@/components/marca/Hero";
import { PastoralInfo } from "@/components/marca/PastoralInfo";
import { FeaturedClubs } from "@/components/marca/FeaturedClubs";
import { Gallery } from "@/components/marca/Gallery";
import { NewsSection } from "@/components/marca/NewsSection";
import { CtaSection } from "@/components/marca/CtaSection";
import { getClubes } from "@/lib/db/clubes";
import { getConteoMiembrosPorClub } from "@/lib/db/estudiantes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [clubes, miembrosPorClub] = await Promise.all([getClubes(), getConteoMiembrosPorClub()]);

  return (
    <main id="contenido" className="bg-white text-neutral-950">
      <Navbar />
      <Hero clubNames={clubes.map((c) => c.nombre)} />
      <PastoralInfo />
      <FeaturedClubs clubes={clubes.slice(0, 6)} miembrosPorClub={miembrosPorClub} />
      <Gallery />
      <NewsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
