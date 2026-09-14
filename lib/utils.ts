import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Configuracion } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generarId(prefijo: string) {
  return `${prefijo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function iniciales(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

/** Día y hora general de pastoral (no por club) — un solo registro en `configuracion`. */
export function formatearHorarioPastoral(config: Pick<Configuracion, "dia_club" | "hora_club"> | null): string | null {
  if (!config?.dia_club) return null;
  if (config.hora_club) return `${config.dia_club}, ${config.hora_club.slice(0, 5)}`;
  return config.dia_club;
}
