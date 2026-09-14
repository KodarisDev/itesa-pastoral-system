import { HeaderSkeleton, CursoNavSkeleton, FilterBarSkeleton, TableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton withAction />
      <div className="space-y-3">
        <CursoNavSkeleton />
        <FilterBarSkeleton widths={["max-w-sm flex-1", "w-52"]} />
        <TableSkeleton rows={10} cols={5} />
      </div>
    </div>
  );
}
