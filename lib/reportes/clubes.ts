import { getClubes, getClubById, getEncargadosDeClub } from "@/lib/db/clubes";
import { getEstudiantesPorClub } from "@/lib/db/estudiantes";
import { getUsuarioById } from "@/lib/db/usuarios";
import type { Club, Estudiante } from "@/types";

export interface ClubConMiembros {
  club: Club;
  encargadoPrincipalNombre: string | null;
  miembros: Estudiante[];
}

/** Datos para el reporte de estudiantes por club: uno o todos, con su encargado principal y su listado de miembros. */
export async function getClubesConMiembros(idClub?: number): Promise<ClubConMiembros[]> {
  const clubes = idClub != null ? [await getClubById(idClub)].filter((c): c is Club => !!c) : await getClubes();

  return Promise.all(
    clubes.map(async (club): Promise<ClubConMiembros> => {
      const [miembros, encargados] = await Promise.all([getEstudiantesPorClub(club.id_club), getEncargadosDeClub(club.id_club)]);
      const principal = encargados.find((e) => e.encargado_principal);
      const usuarioPrincipal = principal ? await getUsuarioById(principal.id_usuario) : null;
      return {
        club,
        encargadoPrincipalNombre: usuarioPrincipal?.nombre ?? null,
        miembros,
      };
    }),
  );
}
