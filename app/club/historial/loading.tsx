import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, SessionListSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <HeaderSkeleton />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
      <SessionListSkeleton rows={6} />
    </div>
  );
}
