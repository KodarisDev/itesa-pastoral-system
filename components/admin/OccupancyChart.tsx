"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useIsDarkMode } from "@/lib/hooks/use-is-dark";
import type { Club } from "@/types";

interface OccupancyChartProps {
  clubes: Club[];
}

export function OccupancyChart({ clubes }: OccupancyChartProps) {
  const isDark = useIsDarkMode();
  const data = clubes.map((c) => ({
    nombre: c.nombre.length > 14 ? `${c.nombre.slice(0, 14)}…` : c.nombre,
    miembros: c.miembrosActuales.length,
    cupo: c.capacidadMaxima,
  }));

  const gridColor = isDark ? "#262626" : "#f0f0f0";
  const axisColor = isDark ? "#737373" : "#a3a3a3";
  const cupoColor = isDark ? "#404040" : "#e5e5e5";

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
          <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${isDark ? "#404040" : "#e5e5e5"}`,
              background: isDark ? "#171717" : "#ffffff",
              color: isDark ? "#f5f5f5" : "#171717",
              fontSize: 12,
            }}
            cursor={{ fill: isDark ? "#262626" : "#fafafa" }}
          />
          <Bar dataKey="cupo" fill={cupoColor} radius={[6, 6, 0, 0]} name="Cupo máximo" />
          <Bar dataKey="miembros" fill="#c0392b" radius={[6, 6, 0, 0]} name="Miembros actuales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
