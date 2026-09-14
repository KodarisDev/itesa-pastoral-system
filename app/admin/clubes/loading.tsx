import { HeaderSkeleton, ClubesTableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton withAction />
      <ClubesTableSkeleton rows={8} />
    </div>
  );
}
