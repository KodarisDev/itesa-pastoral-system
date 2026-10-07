import Link from "next/link";
import { ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentsManager } from "@/components/admin/StudentsManager";
import { getEstudiantesCached, getClubesCached, getSubclubesCached } from "@/lib/db/cached";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminEstudiantesPage({ searchParams }: { searchParams: { matricula?: string } }) {
  await requireVista("estudiantes:ver");

  const [estudiantes, clubes, subclubes] = await Promise.all([getEstudiantesCached(), getClubesCached(), getSubclubesCached()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Estudiantes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{estudiantes.length} estudiante(s) en el listado.</p>
      </div>

      <StudentsManager
        estudiantes={estudiantes}
        clubes={clubes}
        subclubes={subclubes}
        initialMatricula={searchParams.matricula}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/promocion">
              <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
              Cargar 4to nuevo / Promoción
            </Link>
          </Button>
        }
      />
    </div>
  );
}
