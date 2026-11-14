import { fmt } from "@/lib/format";
import { CHART } from "@/lib/status";

/** Barra de capacidad del día: reservadas frente a libres. */
export function RoomsMeter({ booked, available }: { booked: number; available: number }) {
  const total = booked + available;
  const pct = total === 0 ? 0 : (booked / total) * 100;
  return (
    <div className="mt-4">
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Habitaciones reservadas hoy"
      >
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART.primary }} />
      </div>
      <p className="tabular mt-2 flex justify-between text-xs text-slate-500">
        <span>{fmt.int(booked)} reservadas</span>
        <span>{fmt.int(available)} libres</span>
      </p>
    </div>
  );
}
