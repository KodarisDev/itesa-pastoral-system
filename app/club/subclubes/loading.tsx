import { HeaderSkeleton, TableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <HeaderSkeleton />
      <TableSkeleton rows={4} cols={3} />
    </div>
  );
}
