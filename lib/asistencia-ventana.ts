import type { Configuracion } from "@/types";

const DIA_A_INDICE: Record<string, number> = { Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 };

export interface VentanaAsistencia {
  /** false si no hay horario de pastoral configurado — en ese caso no hay restricción. */
  configurada: boolean;
  /** true si `ahora` está dentro de la ventana de 24 horas para pasar lista. */
  abierta: boolean;
  inicio: Date | null;
  fin: Date | null;
  /** Próxima apertura de la ventana — útil cuando `abierta` es false. */
  siguienteInicio: Date | null;
}

/**
 * Calcula si "ahora" cae dentro de la ventana de 24 horas que empieza en la
 * ocurrencia más reciente del día/hora configurado de pastoral (recurrente cada
 * semana). Ej.: si el horario es miércoles 3:05pm, solo se puede pasar lista
 * desde el miércoles 3:05pm hasta el jueves 3:05pm.
 */
export function calcularVentanaAsistencia(
  config: Pick<Configuracion, "dia_club" | "hora_club"> | null,
  ahora: Date = new Date(),
): VentanaAsistencia {
  if (!config?.dia_club || !config.hora_club) {
    return { configurada: false, abierta: true, inicio: null, fin: null, siguienteInicio: null };
  }

  const diaObjetivo = DIA_A_INDICE[config.dia_club];
  if (diaObjetivo == null) return { configurada: false, abierta: true, inicio: null, fin: null, siguienteInicio: null };

  const [horas, minutos] = config.hora_club.split(":").map(Number);

  const diasDesde = (ahora.getDay() - diaObjetivo + 7) % 7;
  const inicio = new Date(ahora);
  inicio.setDate(ahora.getDate() - diasDesde);
  inicio.setHours(horas, minutos, 0, 0);
  if (inicio.getTime() > ahora.getTime()) {
    inicio.setDate(inicio.getDate() - 7);
  }

  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
  const abierta = ahora.getTime() >= inicio.getTime() && ahora.getTime() < fin.getTime();
  const siguienteInicio = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000);

  return { configurada: true, abierta, inicio, fin, siguienteInicio };
}
