import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsGridSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <main className="bg-white text-neutral-950">
      <Navbar />
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <Skeleton className="mx-auto h-6 w-40 rounded-full" />
          <Skeleton className="mx-auto h-9 w-80 max-w-full" />
          <Skeleton className="mx-auto h-4 w-96 max-w-full" />
        </div>
        <CardsGridSkeleton count={6} />
      </section>
      <Footer />
    </main>
  );
}
