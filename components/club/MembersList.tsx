import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Estudiante } from "@/types";

export function MembersList({ miembros }: { miembros: Estudiante[] }) {
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
            <TableRow key={m.id}>
              <TableCell className="font-medium text-gray-900 dark:text-white">
                {m.nombre} {m.apellido}
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{m.curso}</TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{m.matricula}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
