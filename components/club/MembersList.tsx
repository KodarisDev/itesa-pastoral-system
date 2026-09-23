import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Estudiante } from "@/types";

export function MembersList({
  miembros,
  estudiantesEncargadosIds,
}: {
  miembros: Estudiante[];
  estudiantesEncargadosIds?: Set<number>;
}) {
  if (miembros.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
        Tu club todavía no tiene miembros asignados.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Matrícula</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {miembros.map((m) => (
            <TableRow key={m.id_estudiante}>
              <TableCell className="font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <span>
                    {m.nombre} {m.apellido}
                  </span>
                  {estudiantesEncargadosIds?.has(m.id_estudiante) && <Badge variant="brand">Encargado</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{m.curso ?? "—"}</TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{m.matricula}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
