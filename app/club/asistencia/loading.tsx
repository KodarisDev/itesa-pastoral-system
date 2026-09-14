import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, AttendanceRowsSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
      <AttendanceRowsSkeleton rows={7} />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
    </div>
  );
}
