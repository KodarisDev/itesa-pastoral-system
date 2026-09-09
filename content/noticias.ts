import { Megaphone, Shapes, UserPlus, type LucideIcon } from "lucide-react";

export interface Noticia {
  slug: string;
  categoria: string;
  titulo: string;
  fecha: string;
  resumen: string;
  cuerpo: string[];
  icono: LucideIcon;
  cta?: { label: string; href: string };
}

/**
 * Contenido de las noticias del área de Pastoral. Cada noticia se renderiza
 * con la misma plantilla en app/noticias/[slug]/page.tsx — para publicar una
 * nueva noticia basta con agregar un objeto aquí.
 */
export const NOTICIAS: Noticia[] = [
  {
    slug: "apertura-inscripciones-2026",
    categoria: "Inscripciones",
    titulo: "Abrimos inscripciones para el año escolar 2026",
    fecha: "Agosto 2026",
    resumen:
      "Ya puedes elegir tu club deseado y uno alternativo desde el formulario en línea. El proceso toma menos de un minuto.",
    cuerpo: [
      "El área de Pastoral del Instituto Técnico Salesiano abre oficialmente el proceso de inscripción a clubes para el año escolar 2026. Todos los estudiantes del instituto participarán en un club durante la hora curricular, acompañados por un encargado responsable de guiar al grupo semana a semana.",
      "El formulario de inscripción está disponible en línea y solo toma un minuto completarlo: se piden los datos básicos del estudiante (nombre, curso y matrícula) y la elección de un club deseado, más uno alternativo por si el primero llega a su cupo máximo.",
      "Una vez enviada la solicitud, el encargado de pastoral la revisa y confirma la asignación del estudiante a su club deseado o al alternativo, según la disponibilidad de cupos. La confirmación llega de inmediato al finalizar el formulario.",
      "Este año se mantienen los cinco clubes ya conocidos por la comunidad —Coro y Música, Debate y Oratoria, Arte y Pintura, Voleibol y Robótica— cada uno con cupos limitados y un ciclo de trabajo definido para el año escolar.",
    ],
    icono: Megaphone,
    cta: { label: "Inscribirme ahora", href: "/inscripcion" },
  },
  {
    slug: "bienvenida-encargados-2026",
    categoria: "Comunidad",
    titulo: "Bienvenida a los nuevos encargados de club",
    fecha: "Agosto 2026",
    resumen:
      "Estudiantes y profesores se suman como encargados este ciclo, acompañando el pase de lista y el seguimiento de cada grupo.",
    cuerpo: [
      "Cada club del área de Pastoral cuenta con un encargado —estudiante o profesor— que acompaña al grupo durante todo el ciclo escolar. Este año se incorporan nuevos encargados a los cinco clubes activos, renovando el compromiso de la comunidad con la formación integral de los estudiantes.",
      "El rol del encargado va más allá de dirigir la actividad semanal: incluye llevar el pase de lista cada miércoles, dar seguimiento a los miembros del club y mantener actualizado el historial de asistencia a lo largo del ciclo.",
      "Para apoyar esta labor, el sistema de Pastoral ofrece a cada encargado un panel donde puede consultar el listado de su grupo, registrar la asistencia semanal y revisar el histórico de ciclos anteriores, todo desde un mismo lugar.",
      "El área de Pastoral agradece a quienes asumen este compromiso y les da la bienvenida a un nuevo año de trabajo con sus respectivos clubes.",
    ],
    icono: UserPlus,
  },
  {
    slug: "clubes-disponibles-temporada",
    categoria: "Clubes",
    titulo: "Clubes disponibles esta temporada",
    fecha: "Agosto 2026",
    resumen:
      "Desde coro y arte hasta debate y robótica: revisa la lista completa de clubes activos y sus cupos disponibles.",
    cuerpo: [
      "El área de Pastoral confirma la oferta de clubes para el presente año escolar. Cada club ofrece un espacio semanal de una hora, durante la hora curricular, donde los estudiantes desarrollan talentos, valores y sentido de comunidad.",
      "Coro y Música ofrece formación vocal e instrumental pensada para las presentaciones especiales del instituto durante todo el año escolar. Debate y Oratoria trabaja técnicas de argumentación en ciclos cortos, con competencias internas entre los participantes.",
      "Arte y Pintura reúne a los estudiantes en un taller de dibujo, pintura y técnicas mixtas que culmina con una exposición de fin de año. Voleibol ofrece entrenamiento y práctica en ciclos cortos, abierto a todos los cursos del instituto.",
      "Robótica introduce a los estudiantes en la programación y el armado de robots educativos a lo largo de todo el año escolar. Cada club tiene un cupo máximo definido — revisa la disponibilidad actual en la sección de clubes antes de inscribirte.",
    ],
    icono: Shapes,
    cta: { label: "Ver clubes disponibles", href: "/#clubes" },
  },
];

export function getNoticiaBySlug(slug: string): Noticia | undefined {
  return NOTICIAS.find((n) => n.slug === slug);
}
