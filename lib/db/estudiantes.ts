import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Estudiante } from "@/types";
import type { FilaRoster } from "@/lib/excel";
import { getMapaEstudiantesEncargadosPorClub } from "@/lib/db/clubes";

export async function getEstudiantes(): Promise<Estudiante[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("activo", true)
    .order("apellido");
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudianteById(idEstudiante: number): Promise<Estudiante | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("id_estudiante", idEstudiante)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudianteByMatricula(matricula: string): Promise<Estudiante | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("matricula", matricula.trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudiantesByIds(ids: number[]): Promise<Estudiante[]> {
  if (ids.length === 0) return [];
  const { data, error } = await getSupabaseAdmin().from("estudiantes").select("*").in("id_estudiante", ids);
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstudiantesPorClub(idClub: number): Promise<Estudiante[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .select("*")
    .eq("id_club", idClub)
    .eq("activo", true)
    .order("apellido");
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Cantidad de miembros activos por club, para tarjetas/listas públicas y
 * validaciones de cupo. Excluye a los estudiantes que son encargados de su
 * propio club — quedan inscritos pero no ocupan cupo.
 */
export async function getConteoMiembrosPorClub(): Promise<Map<number, number>> {
  const [{ data, error }, exentosPorClub] = await Promise.all([
    getSupabaseAdmin().from("estudiantes").select("id_estudiante, id_club").eq("activo", true).not("id_club", "is", null),
    getMapaEstudiantesEncargadosPorClub(),
  ]);
  if (error) throw new Error(error.message);
  const conteo = new Map<number, number>();
  for (const row of data) {
    if (row.id_club == null) continue;
    if (exentosPorClub.get(row.id_club)?.has(row.id_estudiante)) continue;
    conteo.set(row.id_club, (conteo.get(row.id_club) ?? 0) + 1);
  }
  return conteo;
}

export async function crearEstudiante(estudiante: Omit<Estudiante, "id_estudiante">): Promise<Estudiante> {
  const { data, error } = await getSupabaseAdmin().from("estudiantes").insert(estudiante).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function crearEstudiantes(estudiantes: Omit<Estudiante, "id_estudiante">[]): Promise<Estudiante[]> {
  if (estudiantes.length === 0) return [];
  const { data, error } = await getSupabaseAdmin().from("estudiantes").insert(estudiantes).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarEstudiante(
  idEstudiante: number,
  cambios: Partial<Omit<Estudiante, "id_estudiante">>,
): Promise<Estudiante> {
  const { data, error } = await getSupabaseAdmin()
    .from("estudiantes")
    .update(cambios)
    .eq("id_estudiante", idEstudiante)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Da de alta o actualiza un estudiante por matrícula (matrícula = id estable
 * del estudiante). Si ya existe, actualiza nombre/apellido/curso/numero pero
 * NO toca `activo` ni `id_club` — igual que el sistema hermano, para no
 * reactivar ni desvincular de su club a alguien solo por reaparecer en un
 * listado.
 */
export async function upsertEstudiantePorMatricula(fila: FilaRoster): Promise<Estudiante> {
  const existente = await getEstudianteByMatricula(fila.matricula);
  if (existente) {
    return actualizarEstudiante(existente.id_estudiante, {
      nombre: fila.nombre,
      apellido: fila.apellido,
      curso: fila.curso,
      numero: fila.numero,
    });
  }
  return crearEstudiante({
    nombre: fila.nombre,
    apellido: fila.apellido,
    curso: fila.curso,
    numero: fila.numero,
    matricula: fila.matricula,
    id_club: null,
    activo: true,
  });
}

function calcularCursoPromovido(cursoActual: string | null): string | null {
  const curso = (cursoActual ?? "").trim();
  const grado = curso[0];
  const seccion = curso.slice(1);
  if (grado === "4") return `5${seccion}`;
  if (grado === "5") return `6${seccion}`;
  if (grado === "6") return "ExAlumno";
  return cursoActual;
}

/**
 * Promoción anual: todo estudiante activo de 4to/5to/6to sube de grado
 * conservando su sección (4A→5A, 5A→6A); los de 6to pasan a "ExAlumno" y
 * quedan inactivos. Los `idsNoPasaron` no se promueven — solo quedan
 * inactivos, conservando su curso actual. Réplica exacta de la lógica de
 * Itesa-Psychology-System (pasar-de-curso).
 */
export async function promoverEstudiantes(idsNoPasaron: number[]): Promise<{ promovidos: number; desactivados: number }> {
  const activos = await getEstudiantes();
  const promovibles = activos.filter((e) => e.curso && ["4", "5", "6"].includes(e.curso[0]) && !idsNoPasaron.includes(e.id_estudiante));

  await Promise.all(
    promovibles.map((e) => {
      const cursoNuevo = calcularCursoPromovido(e.curso);
      return actualizarEstudiante(e.id_estudiante, {
        curso: cursoNuevo,
        ...(cursoNuevo === "ExAlumno" ? { activo: false } : {}),
      });
    }),
  );

  if (idsNoPasaron.length > 0) {
    await Promise.all(idsNoPasaron.map((id) => actualizarEstudiante(id, { activo: false })));
  }

  return { promovidos: promovibles.length, desactivados: idsNoPasaron.length };
}
