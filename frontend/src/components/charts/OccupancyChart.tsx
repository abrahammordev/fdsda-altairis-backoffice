"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt, longDate, shortDate } from "@/lib/format";
import { CHART } from "@/lib/status";
import type { OccupancyPoint } from "@/lib/types";
import { TooltipBox } from "./ChartTooltip";

/** Ocupación diaria (%) de todo el inventario, con marca en el día de hoy. */
export function OccupancyChart({ data, today }: { data: OccupancyPoint[]; today: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.25} />
            <stop offset="100%" stopColor={CHART.primary} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fill: CHART.axis, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: CHART.grid }}
          minTickGap={24}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v) => `${v} %`}
          tick={{ fill: CHART.axis, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <ReferenceLine
          x={today}
          stroke={CHART.inkSecondary}
          strokeDasharray="3 3"
          label={{ value: "Hoy", position: "insideTopRight", fill: CHART.inkSecondary, fontSize: 12 }}
        />
        <Tooltip
          cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            const p = payload?.[0]?.payload as OccupancyPoint | undefined;
            if (!active || !p) return null;
            return (
              <TooltipBox
                title={longDate(p.date)}
                rows={[
                  { label: "Ocupación", value: fmt.pct(p.occupancyPct), color: CHART.primary },
                  { label: "Reservadas", value: `${fmt.int(p.bookedRooms)} / ${fmt.int(p.totalRooms)}` },
                ]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="occupancyPct"
          stroke={CHART.primary}
          strokeWidth={2}
          fill="url(#occupancyFill)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
