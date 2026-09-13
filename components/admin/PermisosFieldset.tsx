"use client";

import { PERMISOS_ASIGNABLES, type Permission } from "@/types";

interface PermisosFieldsetProps {
  idPrefix: string;
  seleccionados: Permission[];
  onToggle: (permiso: Permission, marcado: boolean) => void;
}

/** Checklist de permisos agrupado por módulo, para el formulario de un administrador. */
export function PermisosFieldset({ idPrefix, seleccionados, onToggle }: PermisosFieldsetProps) {
  const grupos = Array.from(new Set(PERMISOS_ASIGNABLES.map((p) => p.grupo)));

  return (
    <div className="space-y-4">
      {grupos.map((grupo) => (
        <div key={grupo}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{grupo}</p>
          <div className="space-y-1.5">
            {PERMISOS_ASIGNABLES.filter((p) => p.grupo === grupo).map(({ permiso, label }) => (
              <label
                key={permiso}
                htmlFor={`${idPrefix}-${permiso}`}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  id={`${idPrefix}-${permiso}`}
                  type="checkbox"
                  name="permisos"
                  value={permiso}
                  checked={seleccionados.includes(permiso)}
                  onChange={(e) => onToggle(permiso, e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
