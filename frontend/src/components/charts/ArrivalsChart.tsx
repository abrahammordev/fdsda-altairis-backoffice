"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt, longDate, shortDate } from "@/lib/format";
import { CHART } from "@/lib/status";
import type { OccupancyPoint } from "@/lib/types";
import { TooltipBox } from "./ChartTooltip";

/** Llegadas (check-ins) por día. El día de hoy se resalta con el tono pleno; el resto más claro. */
export function ArrivalsChart({ data, today }: { data: OccupancyPoint[]; today: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fill: CHART.axis, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: CHART.grid }}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tick={{ fill: CHART.axis, fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(11,11,11,0.04)" }}
          content={({ active, payload }) => {
            const p = payload?.[0]?.payload as OccupancyPoint | undefined;
            if (!active || !p) return null;
            return (
              <TooltipBox
                title={longDate(p.date)}
                rows={[{ label: "Llegadas", value: fmt.int(p.arrivals), color: CHART.secondary }]}
              />
            );
          }}
        />
        <Bar dataKey="arrivals" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.date} fill={CHART.secondary} fillOpacity={d.date === today ? 1 : 0.55} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
