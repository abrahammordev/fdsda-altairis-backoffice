import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Franja de cifras del día: un único bloque con las métricas separadas por divisores,
 * en lugar de tarjetas sueltas. En móvil pasa a dos columnas.
 */
export function StatStrip({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-label="Cifras del día"
      className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:grid-cols-3 xl:grid-cols-6 [&>*]:border-slate-100 [&>*]:border-b [&>*]:border-r"
    >
      {children}
    </section>
  );
}

/** Una métrica de la franja: etiqueta pequeña, cifra grande y una línea de contexto. */
export function Stat({
  label,
  value,
  context,
  emphasis,
  children,
}: {
  label: string;
  value: string;
  context?: string;
  /** Resalta la métrica principal (barra de color a la izquierda) */
  emphasis?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={emphasis ? "relative p-5 before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-r before:bg-teal-600" : "p-5"}>
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {context && <p className="mt-1 text-xs text-slate-500">{context}</p>}
      {children}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="p-5" aria-hidden>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}
