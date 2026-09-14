import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, StatCardsSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <StatCardsSkeleton count={4} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Skeleton className="mb-4 h-5 w-36" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Skeleton className="mb-2 h-5 w-56" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-gray-50 px-3 py-2.5 dark:border-neutral-800/60">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
