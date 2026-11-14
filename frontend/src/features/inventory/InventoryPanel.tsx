"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { shortDate } from "@/lib/format";
import { InventoryCalendar, InventoryCalendarSkeleton } from "./InventoryCalendar";
import { useHotelInventory } from "./useHotelInventory";

/** Tarjeta con el calendario de inventario de un hotel y navegación por semanas. */
export function InventoryPanel({ hotelId, action }: { hotelId: string; action?: React.ReactNode }) {
  const { query, from, to, dates, today, prev, next, reset } = useHotelInventory(hotelId);

  return (
    <Card>
      <CardHeader
        title="Disponibilidad"
        subtitle={`Del ${shortDate(from)} al ${shortDate(to)}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={prev} aria-label="Semana anterior">
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button variant="secondary" size="sm" onClick={reset} disabled={from === today}>
              Hoy
            </Button>
            <Button variant="secondary" size="sm" onClick={next} aria-label="Semana siguiente">
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            {action}
          </div>
        }
      />
      {query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <InventoryCalendarSkeleton />
      ) : query.data.roomTypes.length === 0 ? (
        <EmptyState title="Este hotel no tiene tipos de habitación" description="Añade un tipo de habitación para cargar disponibilidad." />
      ) : (
        <div className={query.isFetching ? "opacity-60 transition-opacity" : undefined}>
          <InventoryCalendar data={query.data} dates={dates} today={today} />
        </div>
      )}
    </Card>
  );
}
