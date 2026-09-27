"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateSessionSelectProps {
  id?: string;
  /** Fechas en formato YYYY-MM-DD, no necesariamente ordenadas ni sin repetir. */
  fechas: string[];
  value: string;
  onChange: (value: string) => void;
  /** Valor especial para "todos los días" (opcional). Si se omite, no se ofrece esa opción. */
  allValue?: string;
  allLabel?: string;
  placeholder?: string;
  className?: string;
}

/** "2026-03" -> "Marzo 2026", con la primera letra en mayúscula. */
function etiquetaMes(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  const texto = format(new Date(anio, mes - 1, 1), "MMMM yyyy", { locale: es });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Combobox buscable por teclado para elegir un día en el que se pasó lista,
 * agrupado por mes. Reemplaza al <select nativo> en los filtros de asistencia,
 * donde la lista de miércoles puede crecer bastante en un ciclo escolar.
 */
export function DateSessionSelect({
  id,
  fechas,
  value,
  onChange,
  allValue,
  allLabel = "Todos los días",
  placeholder = "Selecciona un día",
  className,
}: DateSessionSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const fechasOrdenadas = useMemo(() => Array.from(new Set(fechas)).sort((a, b) => b.localeCompare(a)), [fechas]);

  const grupos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const porMes = new Map<string, { fecha: string; etiqueta: string }[]>();
    for (const fecha of fechasOrdenadas) {
      const etiqueta = format(new Date(`${fecha}T00:00:00`), "EEEE d 'de' MMMM yyyy", { locale: es });
      if (q && !etiqueta.toLowerCase().includes(q) && !fecha.includes(q)) continue;
      const clave = fecha.slice(0, 7);
      if (!porMes.has(clave)) porMes.set(clave, []);
      porMes.get(clave)!.push({ fecha, etiqueta });
    }
    return Array.from(porMes.entries());
  }, [fechasOrdenadas, query]);

  const mostrarTodos = allValue != null && (!query.trim() || allLabel.toLowerCase().includes(query.trim().toLowerCase()));

  const etiquetaSeleccionada =
    allValue != null && value === allValue
      ? allLabel
      : value
        ? format(new Date(`${value}T00:00:00`), "EEEE d 'de' MMMM yyyy", { locale: es })
        : null;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 outline-none transition-colors duration-300 focus:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-red-600",
            className,
          )}
        >
          <span className={cn("truncate capitalize", !etiquetaSeleccionada && "text-gray-400 dark:text-gray-500")}>
            {etiquetaSeleccionada ?? placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="border-b border-gray-100 p-2 dark:border-neutral-800">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por fecha…"
              className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2 text-sm text-gray-700 outline-none focus:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {mostrarTodos && (
            <button
              type="button"
              onClick={() => {
                onChange(allValue!);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-800"
            >
              {allLabel}
              {value === allValue && <Check className="h-4 w-4 text-brand" aria-hidden="true" />}
            </button>
          )}

          {grupos.length === 0 && !mostrarTodos && (
            <p className="px-2.5 py-4 text-center text-xs text-gray-400 dark:text-gray-500">Ningún día coincide.</p>
          )}

          {grupos.map(([mes, dias]) => (
            <div key={mes} className="pt-1">
              <p className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {etiquetaMes(mes)}
              </p>
              {dias.map((d) => (
                <button
                  key={d.fecha}
                  type="button"
                  onClick={() => {
                    onChange(d.fecha);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm capitalize text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-800"
                >
                  <span className="truncate">{d.etiqueta}</span>
                  {value === d.fecha && <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
