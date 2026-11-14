"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrivalsChart } from "@/components/charts/ArrivalsChart";
import { Stat, StatSkeleton, StatStrip } from "@/components/charts/StatStrip";
import { OccupancyChart } from "@/components/charts/OccupancyChart";
import { RoomsMeter } from "@/components/charts/RoomsMeter";
import { StatusBreakdown } from "@/components/charts/StatusBreakdown";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ChartSkeleton, Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState, PageHeader } from "@/components/ui/States";
import { api } from "@/lib/api";
import { fmt, longDate, shortDate } from "@/lib/format";

export function DashboardView() {
  const summary = useQuery({ queryKey: ["dashboard", "summary"], queryFn: api.dashboard.summary });
  const occupancy = useQuery({ queryKey: ["dashboard", "occupancy"], queryFn: () => api.dashboard.occupancy() });
  const latest = useQuery({
    queryKey: ["reservations", "latest"],
    queryFn: () => api.reservations.search({ size: 6 }),
  });

  const s = summary.data;
  const today = s?.date ?? "";

  return (
    <>
      <PageHeader
        title="Operativa de hoy"
        subtitle={s ? longDate(s.date) : "Ocupación, entradas, salidas y actividad"}
      />

      {/* KPIs del día */}
      {summary.isError ? (
        <Card className="mb-6">
          <ErrorState message={summary.error.message} onRetry={() => summary.refetch()} />
        </Card>
      ) : (
        <div className="mb-6">
          <StatStrip>
            {!s ? (
              Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <Stat label="Ocupación" value={fmt.pct(s.occupancyPct)} emphasis>
                  <RoomsMeter booked={s.roomsBooked} available={s.roomsAvailable} />
                </Stat>
                <Stat label="Entradas" value={fmt.int(s.arrivals)} context="Estancias que empiezan hoy" />
                <Stat label="Salidas" value={fmt.int(s.departures)} context="Estancias que terminan hoy" />
                <Stat label="En casa" value={fmt.int(s.inHouse)} context="Estancias activas esta noche" />
                <Stat
                  label="Nuevas hoy"
                  value={fmt.int(s.reservationsCreatedToday)}
                  context={`${fmt.int(s.reservationsByStatus.PENDING)} por confirmar`}
                />
                <Stat label="Facturación 30 d" value={fmt.eurCompact(s.revenueLast30Days)} context="Sin canceladas" />
              </>
            )}
          </StatStrip>
        </div>
      )}

      {/* Ocupación y reparto por estado */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Ocupación diaria" subtitle="Habitaciones reservadas sobre el total, última semana y próximos 30 días" />
          {occupancy.isError ? (
            <ErrorState message={occupancy.error.message} onRetry={() => occupancy.refetch()} />
          ) : occupancy.data && today ? (
            <OccupancyChart data={occupancy.data} today={today} />
          ) : (
            <ChartSkeleton height={280} />
          )}
        </Card>
        <Card>
          <CardHeader title="Cartera de reservas" subtitle="Confirmadas, pendientes y canceladas" />
          {s ? (
            <StatusBreakdown counts={s.reservationsByStatus} />
          ) : (
            <div className="space-y-4" aria-hidden>
              <Skeleton className="h-3 w-full rounded-full" />
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Llegadas y actividad reciente */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Entradas por día" subtitle="Estancias que empiezan cada día; hoy resaltado" />
          {occupancy.data && today ? (
            <ArrivalsChart data={occupancy.data} today={today} />
          ) : (
            <ChartSkeleton height={220} />
          )}
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader
            title="Actividad reciente"
            subtitle="Últimas reservas registradas"
            action={
              <Link href="/reservations" className="text-sm font-medium text-teal-700 hover:text-teal-800">
                Ver todas
              </Link>
            }
          />
          {latest.isError ? (
            <ErrorState message={latest.error.message} onRetry={() => latest.refetch()} />
          ) : !latest.data ? (
            <TableSkeleton rows={6} cols={2} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {latest.data.content.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{r.holderName}</p>
                    <p className="truncate text-xs text-slate-500">
                      {r.hotelName} · {shortDate(r.checkIn)} → {shortDate(r.checkOut)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
