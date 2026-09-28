import { HeaderSkeleton, FilterBarSkeleton, TableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="space-y-3">
        <FilterBarSkeleton widths={["max-w-sm flex-1", "w-44", "w-52"]} actionWidths={["w-64"]} />
        <TableSkeleton rows={10} cols={6} />
      </div>
    </div>
  );
}
