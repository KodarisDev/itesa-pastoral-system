import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, StatCardsSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <StatCardsSkeleton count={4} />
      <div className="grid grid-cols-1 gap-4">
        {/* "Asistencia del miércoles ... por club" — lista de clubes con su badge de presentes */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Skeleton className="mb-4 h-5 w-72 max-w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-gray-50 px-3 py-2.5 dark:border-neutral-800/60">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        {/* "Ocupación por club" — barras horizontales, una por club */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
