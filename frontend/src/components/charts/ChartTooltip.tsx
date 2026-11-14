/** Contenedor común de los tooltips de Recharts. */
export function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-slate-900">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center justify-between gap-4 text-slate-600">
          <span className="flex items-center gap-1.5">
            {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} aria-hidden />}
            {r.label}
          </span>
          <span className="tabular font-medium text-slate-900">{r.value}</span>
        </p>
      ))}
    </div>
  );
}
