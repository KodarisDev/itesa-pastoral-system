import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Club } from "@/types";

export function ClubHeaderCard({ club }: { club: Club }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-800">
        {club.fotoUrl ? (
          <Image src={club.fotoUrl} alt={club.nombre} width={96} height={96} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">Sin foto</div>
        )}
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{club.nombre}</h1>
        <p className="mt-1 max-w-lg text-sm text-gray-500 dark:text-gray-400">{club.descripcion}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">
            {club.miembrosActuales.length} / {club.capacidadMaxima} miembros
          </Badge>
          <Badge variant="outline">{club.duracionMeses} meses de duración</Badge>
          <Badge variant="outline">Ciclo #{club.cicloActual.numero}</Badge>
        </div>
      </div>
    </div>
  );
}
