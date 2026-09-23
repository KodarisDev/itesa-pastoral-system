import type { Configuracion } from "@/types";
import { ZONA_HORARIA_PASTORAL } from "@/lib/constants";

const DIA_A_INDICE: Record<string, number> = { Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 };
const FORMATEADOR_PARTES_ZONA = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA_HORARIA_PASTORAL,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partesEnZona(date: Date) {
  const partes = Object.fromEntries(FORMATEADOR_PARTES_ZONA.formatToParts(date).map(({ type, value }) => [type, value]));
  return {
    year: Number(partes.year),
    month: Number(partes.month),
    day: Number(partes.day),
    hour: Number(partes.hour),
    minute: Number(partes.minute),
    second: Number(partes.second),
  };
}

function horaLocalComoUtc(date: Date) {
  const partes = partesEnZona(date);
  return Date.UTC(partes.year, partes.month - 1, partes.day, partes.hour, partes.minute, partes.second);
}

function convertirHoraLocalAFecha(horaLocalUtc: number) {
  let timestamp = horaLocalUtc;
  for (let intento = 0; intento < 2; intento += 1) {
    timestamp = horaLocalUtc - (horaLocalComoUtc(new Date(timestamp)) - timestamp);
  }
  return new Date(timestamp);
}

export function formatearFechaHoraPastoral(date: Date): string {
  const partes = new Intl.DateTimeFormat("es-DO", {
    timeZone: ZONA_HORARIA_PASTORAL,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.weekday} ${valores.day} de ${valores.month}, ${valores.hour}:${valores.minute}`;
}

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

  const ahoraLocal = horaLocalComoUtc(ahora);
  const ahoraLocalDate = new Date(ahoraLocal);
  const diasDesde = (ahoraLocalDate.getUTCDay() - diaObjetivo + 7) % 7;
  const inicioLocal = new Date(ahoraLocal);
  inicioLocal.setUTCDate(ahoraLocalDate.getUTCDate() - diasDesde);
  inicioLocal.setUTCHours(horas, minutos, 0, 0);
  if (inicioLocal.getTime() > ahoraLocal) {
    inicioLocal.setUTCDate(inicioLocal.getUTCDate() - 7);
  }

  const inicio = convertirHoraLocalAFecha(inicioLocal.getTime());
  const fin = convertirHoraLocalAFecha(inicioLocal.getTime() + 24 * 60 * 60 * 1000);
  const abierta = ahora.getTime() >= inicio.getTime() && ahora.getTime() < fin.getTime();
  const siguienteInicio = convertirHoraLocalAFecha(inicioLocal.getTime() + 7 * 24 * 60 * 60 * 1000);

  return { configurada: true, abierta, inicio, fin, siguienteInicio };
}
