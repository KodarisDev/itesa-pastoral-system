"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useIsDarkMode } from "@/lib/hooks/use-is-dark";
import type { Club } from "@/types";

interface OccupancyChartProps {
  clubes: Club[];
  miembrosPorClub: Map<number, number>;
}

export function OccupancyChart({ clubes, miembrosPorClub }: OccupancyChartProps) {
  const isDark = useIsDarkMode();
  const data = clubes.map((c) => ({
    nombre: c.nombre,
    miembros: miembrosPorClub.get(c.id_club) ?? 0,
    cupo: c.capacidad ?? 0,
  }));

  const gridColor = isDark ? "#262626" : "#f0f0f0";
  const axisColor = isDark ? "#737373" : "#a3a3a3";
  const cupoColor = isDark ? "#404040" : "#e5e5e5";

  // Barras horizontales: los nombres completos caben a la izquierda y la altura
  // crece con la cantidad de clubes para que ninguno quede sin etiqueta.
  const alto = Math.max(288, data.length * 48);

  return (
    <div className="w-full" style={{ height: alto }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={2} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
          <XAxis type="number" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="nombre"
            width={190}
            interval={0}
            tick={{ fontSize: 12, fill: axisColor }}
            stroke={axisColor}
          />
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
          <Bar dataKey="cupo" fill={cupoColor} radius={[0, 6, 6, 0]} name="Cupo máximo" />
          <Bar dataKey="miembros" fill="#c0392b" radius={[0, 6, 6, 0]} name="Miembros actuales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
