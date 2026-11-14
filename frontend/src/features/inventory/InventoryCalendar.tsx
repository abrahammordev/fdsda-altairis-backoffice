import clsx from "clsx";
import { fmt, isWeekend, longDate, parseIsoDate, weekdayLetter } from "@/lib/format";
import { NO_INVENTORY, OCCUPANCY_SCALE, occupancyColor } from "@/lib/status";
import type { HotelInventory, InventoryDay } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Mapa de calor del inventario de un hotel: una fila por tipo de habitación, una celda por día.
 * El color indica la ocupación y el número, las habitaciones libres (la cifra nunca depende solo del color).
 */
export function InventoryCalendar({ data, dates, today }: { data: HotelInventory; dates: string[]; today: string }) {
  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <table className="border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-36 bg-white pr-2 text-left font-medium text-slate-500" scope="col">
                Tipo de habitación
              </th>
              {dates.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className={clsx("w-9 min-w-9 text-center font-normal", isWeekend(d) ? "text-slate-900" : "text-slate-500")}
                >
                  <span className="block">{weekdayLetter(d)}</span>
                  <span className={clsx("block tabular", d === today && "rounded bg-teal-700 font-semibold text-white")}>
                    {parseIsoDate(d).getDate()}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.roomTypes.map((rt) => {
              const byDate = new Map(rt.days.map((day) => [day.date, day]));
              return (
                <tr key={rt.roomTypeId}>
                  <th scope="row" className="sticky left-0 z-10 bg-white pr-2 text-left text-sm font-medium text-slate-700">
                    {rt.name}
                  </th>
                  {dates.map((d) => (
                    <Cell key={d} date={d} day={byDate.get(d)} roomType={rt.name} />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Legend />
    </div>
  );
}

function Cell({ date, day, roomType }: { date: string; day?: InventoryDay; roomType: string }) {
  if (!day) {
    return (
      <td
        className="h-9 rounded text-center"
        style={{ background: NO_INVENTORY.bg, color: NO_INVENTORY.fg }}
        title={`${roomType} · ${longDate(date)}: sin inventario cargado`}
      >
        –
      </td>
    );
  }
  const { bg, fg } = occupancyColor(day.occupancyPct, day.totalRooms);
  return (
    <td
      className="tabular h-9 rounded text-center font-medium"
      style={{ background: bg, color: fg }}
      title={`${roomType} · ${longDate(date)}\nLibres: ${day.availableRooms} de ${day.totalRooms} · Ocupación ${fmt.pct(day.occupancyPct)} · ${fmt.eurPrecise(day.price)}`}
    >
      {day.availableRooms}
    </td>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
      <span className="font-medium text-slate-700">Ocupación:</span>
      {OCCUPANCY_SCALE.map((s) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm" style={{ background: s.bg }} aria-hidden />
          {s.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm" style={{ background: NO_INVENTORY.bg }} aria-hidden />
        Sin inventario
      </span>
      <span className="text-slate-500">· El número es el de habitaciones libres</span>
    </div>
  );
}

export function InventoryCalendarSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Cargando calendario" className="space-y-1">
      {Array.from({ length: rows + 1 }).map((_, r) => (
        <div key={r} className="flex gap-0.5">
          <Skeleton className="h-9 w-36 shrink-0" />
          {Array.from({ length: 21 }).map((_, c) => (
            <Skeleton key={c} className="h-9 w-9 shrink-0" />
          ))}
        </div>
      ))}
    </div>
  );
}
