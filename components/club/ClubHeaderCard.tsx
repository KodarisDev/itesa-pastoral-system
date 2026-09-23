import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ClubFotoUploader } from "@/components/club/ClubFotoUploader";
import { formatearHorarioPastoral } from "@/lib/utils";
import type { Club, Configuracion } from "@/types";

export function ClubHeaderCard({
  club,
  miembrosActuales,
  estudiantesEncargados = 0,
  configuracion,
  puedeEditarFoto = false,
}: {
  club: Club;
  miembrosActuales: number;
  estudiantesEncargados?: number;
  configuracion?: Configuracion | null;
  puedeEditarFoto?: boolean;
}) {
  const horario = configuracion ? formatearHorarioPastoral(configuracion) : null;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-800">
        {club.foto ? (
          <Image src={club.foto} alt={club.nombre} width={96} height={96} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">Sin foto</div>
        )}
        {puedeEditarFoto && <ClubFotoUploader clubId={club.id_club} />}
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{club.nombre}</h1>
        <p className="mt-1 max-w-lg text-sm text-gray-500 dark:text-gray-400">{club.descripcion}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">
            {miembrosActuales} / {club.capacidad ?? "∞"} miembros
          </Badge>
          {estudiantesEncargados > 0 && (
            <Badge variant="outline">
              +{estudiantesEncargados} encargado{estudiantesEncargados === 1 ? "" : "s"} estudiante{estudiantesEncargados === 1 ? "" : "s"}
            </Badge>
          )}
          {horario && <Badge variant="outline">Hora de pastoral: {horario}</Badge>}
        </div>
      </div>
    </div>
  );
}
