"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useIsDarkMode } from "@/lib/hooks/use-is-dark";
import type { SolicitudInscripcion } from "@/types";

interface RequestsStatusChartProps {
  solicitudes: SolicitudInscripcion[];
}

const COLORES: Record<string, string> = {
  Pendiente: "#f59e0b",
  Aceptada: "#15803d",
  Rechazada: "#c0392b",
};

export function RequestsStatusChart({ solicitudes }: RequestsStatusChartProps) {
  const isDark = useIsDarkMode();
  const conteo = {
    Pendiente: solicitudes.filter((s) => s.estado === "pendiente").length,
    Aceptada: solicitudes.filter((s) => s.estado === "aceptada").length,
    Rechazada: solicitudes.filter((s) => s.estado === "rechazada").length,
  };
  const data = Object.entries(conteo)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <p className="flex h-72 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        Aún no hay solicitudes.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
            {data.map((d) => (
              <Cell key={d.name} fill={COLORES[d.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${isDark ? "#404040" : "#e5e5e5"}`,
              background: isDark ? "#171717" : "#ffffff",
              color: isDark ? "#f5f5f5" : "#171717",
              fontSize: 12,
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: isDark ? "#d4d4d4" : "#404040" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
