import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, FilterBarSkeleton, TableSkeleton } from "@/components/shared/PageSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="flex gap-2 border-b border-gray-100 pb-px dark:border-neutral-800">
        <Skeleton className="h-9 w-24 rounded-t-lg" />
        <Skeleton className="h-9 w-28 rounded-t-lg" />
        <Skeleton className="h-9 w-20 rounded-t-lg" />
      </div>
      {/* Pestaña "Encargados": filtro de Tipo (a la izquierda) + botón Nuevo encargado (a la derecha) */}
      <FilterBarSkeleton widths={["w-40"]} actionWidths={["w-40"]} />
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
