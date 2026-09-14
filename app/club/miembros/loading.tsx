import { HeaderSkeleton, TableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <TableSkeleton rows={8} cols={3} />
    </div>
  );
}
