import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {withAction && <Skeleton className="h-10 w-36 rounded-xl" />}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "h-72" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className="h-[calc(100%-2rem)] w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-4 border-b border-gray-100 px-4 py-3 dark:border-neutral-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-gray-50 px-4 py-3.5 last:border-0 dark:border-neutral-800/60">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** Fila de filtros (búsqueda + selects), como en las tablas de Estudiantes/Clubes/Asistencias. */
export function FilterBarSkeleton({ widths = ["w-full max-w-sm", "w-44", "w-52"] }: { widths?: string[] }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {widths.map((w, i) => (
        <div key={i} className={`space-y-1.5 ${w}`}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** Barra de navegación por curso de Estudiantes: flecha — dropdown + contador — flecha. */
export function CursoNavSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
      <div className="flex flex-col items-center gap-1.5">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
    </div>
  );
}

/** Tarjetas colapsables de sesión, como en Asistencias (admin e historial del encargado). */
export function SessionListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Fila club + encargado, como ClubsTable — mobile (tarjetas) y desktop (tabla) a la vez. */
export function ClubesTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      <div className="space-y-2 md:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2.5 rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:block">
        <div className="flex gap-4 border-b border-gray-100 px-4 py-3 dark:border-neutral-800">
          <Skeleton className="h-4 flex-[2]" />
          <Skeleton className="h-4 flex-[2]" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-0 dark:border-neutral-800/60">
            <Skeleton className="h-4 flex-[2]" />
            <Skeleton className="h-4 flex-[2]" />
            <Skeleton className="h-5 w-16 flex-1 rounded-full" />
            <div className="flex flex-1 justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Fila de switch presente/ausente, como AttendanceSheet. */
export function AttendanceRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      ))}
    </div>
  );
}
