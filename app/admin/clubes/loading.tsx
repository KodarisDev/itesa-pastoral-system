import { HeaderSkeleton, FilterBarSkeleton, ClubesTableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <FilterBarSkeleton widths={["w-full max-w-sm"]} actionWidths={["w-44", "w-32"]} />
      <ClubesTableSkeleton rows={8} />
    </div>
  );
}
