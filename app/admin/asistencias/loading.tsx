import { HeaderSkeleton, StatCardsSkeleton, FilterBarSkeleton, SessionListSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton withAction />
      <StatCardsSkeleton count={4} />
      <FilterBarSkeleton widths={["w-44", "flex-1", "w-40", "w-40"]} />
      <SessionListSkeleton rows={5} />
    </div>
  );
}
