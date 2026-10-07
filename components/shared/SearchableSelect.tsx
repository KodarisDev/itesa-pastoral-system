"use client";

import { useId, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  /** Texto secundario a la derecha (p. ej. "3 subclubes"). */
  hint?: string;
  /** Texto extra que también se usa al buscar. */
  keywords?: string;
}

interface SearchableSelectProps {
  id?: string;
  options: SearchableOption[];
  /** Valor seleccionado; si se omite (undefined) el control es de "acción": no muestra selección. */
  value?: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Combobox con buscador (se puede escribir para filtrar). Lista todas las
 * opciones al abrirse. Mismo estilo que el selector de clubes de Subclubes.
 */
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados.",
  disabled,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listId = useId();

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => `${o.label} ${o.keywords ?? ""}`.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const seleccionada = options.find((o) => o.value === value) ?? null;

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
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 outline-none transition-colors duration-300 focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:focus:border-red-600",
            className,
          )}
        >
          <span className={cn("truncate", !seleccionada && "text-gray-400 dark:text-gray-500")}>
            {seleccionada?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0" align="start">
        <div className="border-b border-gray-100 p-2 dark:border-neutral-800">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2 text-sm text-gray-700 outline-none focus:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200"
            />
          </div>
        </div>
        <div id={listId} className="max-h-64 overflow-y-auto p-1" role="listbox">
          {filtradas.length === 0 ? (
            <p className="px-2.5 py-4 text-center text-xs text-gray-400 dark:text-gray-500">{emptyText}</p>
          ) : (
            filtradas.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={value === o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-800"
              >
                <span className="truncate">{o.label}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {o.hint && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
                      {o.hint}
                    </span>
                  )}
                  {value === o.value && <Check className="h-4 w-4 text-brand" aria-hidden="true" />}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
