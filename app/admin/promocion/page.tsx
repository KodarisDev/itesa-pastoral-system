import { PromocionManager } from "@/components/admin/PromocionManager";
import { getEstudiantes } from "@/lib/db/estudiantes";
import { requireVista } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminPromocionPage() {
  await requireVista("estudiantes:promover");

  const estudiantes = await getEstudiantes();
  const promovibles = estudiantes.filter((e) => e.curso && ["4", "5", "6"].includes(e.curso[0]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Promoción de curso</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sube el listado oficial de los nuevos estudiantes de 4to y promueve al resto del instituto de una vez.
        </p>
      </div>

      <PromocionManager estudiantes={promovibles} />
    </div>
  );
}
