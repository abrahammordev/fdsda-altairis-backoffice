import { fmt } from "@/lib/format";
import { STATUS, STATUS_ORDER } from "@/lib/status";
import type { ReservationStatus } from "@/lib/types";

/**
 * Reparto de reservas por estado: una barra apilada de proporción y debajo la lista
 * con etiqueta, cifra y porcentaje (el color nunca va solo).
 */
export function StatusBreakdown({ counts }: { counts: Record<ReservationStatus, number> }) {
  const total = STATUS_ORDER.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);

  return (
    <div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Reparto de reservas por estado">
        {STATUS_ORDER.map((s) => (
          <div
            key={s}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${pct(counts[s])}%`, background: STATUS[s].color }}
            title={`${STATUS[s].label}: ${fmt.int(counts[s])}`}
          />
        ))}
      </div>
      <ul className="mt-5 divide-y divide-slate-100">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="flex items-center justify-between py-2.5 text-sm">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="size-2.5 rounded-full" style={{ background: STATUS[s].color }} aria-hidden />
              {STATUS[s].label}
            </span>
            <span className="tabular text-slate-900">
              <span className="font-semibold">{fmt.int(counts[s])}</span>
              <span className="ml-2 inline-block w-14 text-right text-slate-500">{fmt.pct(pct(counts[s]))}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-sm">
        <span className="text-slate-500">Total</span>
        <span className="tabular font-semibold">{fmt.int(total)}</span>
      </p>
    </div>
  );
}
