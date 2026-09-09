"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

/** Switch hand-rolled sobre un checkbox oculto, per §7.5 de la guía de diseño. */
export function Switch({ checked, onCheckedChange, label, id }: SwitchProps) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2">
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full bg-gray-200 transition-colors duration-300 dark:bg-neutral-700",
          "after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-black/5 after:bg-white after:shadow after:transition-all after:duration-300",
          "peer-checked:bg-success peer-checked:after:translate-x-full",
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-red-500/30",
        )}
      />
      {label && <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>}
    </label>
  );
}
