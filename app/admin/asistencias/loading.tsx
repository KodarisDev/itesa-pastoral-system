import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, StatCardsSkeleton, SessionListSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton withAction />
      <StatCardsSkeleton count={4} />
      {/* Fila de filtros: Club, Buscar estudiante, Día de asistencia */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <SessionListSkeleton rows={5} />
    </div>
  );
}
