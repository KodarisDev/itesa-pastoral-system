import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, TableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <HeaderSkeleton />
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
      <TableSkeleton rows={7} cols={4} />
    </div>
  );
}
