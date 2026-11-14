import clsx from "clsx";

/** Bloque gris con brillo mientras llegan los datos. */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={clsx("skeleton rounded-md", className)} style={style} />;
}

/** Filas de tabla vacías con la misma altura que las reales, para evitar saltos al cargar. */
export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={clsx("h-4", c === 0 ? "w-1/4" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div role="status" aria-label="Cargando gráfica" className="flex items-end gap-2" style={{ height }}>
      {[45, 70, 55, 85, 60, 75, 50, 90, 65, 80, 58, 72].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
