import clsx from "clsx";
import { Star } from "lucide-react";
import { STATUS } from "@/lib/status";
import type { ReservationStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        s.badge,
      )}
    >
      <span className="size-1.5 rounded-full" style={{ background: s.color }} aria-hidden />
      {s.label}
    </span>
  );
}

export function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${count} estrellas`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-3.5 fill-current" aria-hidden />
      ))}
    </span>
  );
}
