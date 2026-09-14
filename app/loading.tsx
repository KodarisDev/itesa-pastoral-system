import { Navbar } from "@/components/marca/Navbar";
import { Footer } from "@/components/marca/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="bg-white text-neutral-950">
      <Navbar />
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <Skeleton className="mx-auto h-6 w-48 rounded-full" />
          <Skeleton className="mx-auto h-12 w-full max-w-xl" />
          <Skeleton className="mx-auto h-4 w-80 max-w-full" />
          <Skeleton className="mx-auto h-11 w-44 rounded-full" />
        </div>
      </section>
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8">
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
      <Footer />
    </main>
  );
}
