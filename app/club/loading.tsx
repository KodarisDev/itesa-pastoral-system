import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, StatCardsSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row">
        <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
        </div>
      </div>
      <StatCardsSkeleton count={2} />
    </div>
  );
}
