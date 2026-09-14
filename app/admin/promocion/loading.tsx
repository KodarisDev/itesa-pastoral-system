import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-80 max-w-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-56 rounded-xl" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
    </div>
  );
}
