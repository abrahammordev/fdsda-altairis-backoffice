import { StatSkeleton, StatStrip } from "@/components/charts/StatStrip";
import { Card } from "./Card";
import { ChartSkeleton, Skeleton, TableSkeleton } from "./Skeleton";

/*
 * Esqueletos de página completos. Se usan como fallback de <Suspense> en cada page.tsx,
 * así forman parte del HTML inicial y el usuario ve la estructura antes de que lleguen los datos.
 */

function HeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2" aria-hidden>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy aria-label="Cargando panel">
      <HeaderSkeleton />
      <div className="mb-6">
        <StatStrip>
          {Array.from({ length: 6 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </StatStrip>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ChartSkeleton height={280} />
        </Card>
        <Card>
          <TableSkeleton rows={4} cols={2} />
        </Card>
      </div>
    </div>
  );
}

export function ListPageSkeleton({ filters = 2 }: { filters?: number }) {
  return (
    <div aria-busy aria-label="Cargando">
      <HeaderSkeleton />
      <Card>
        <div className="mb-4 flex gap-3">
          {Array.from({ length: filters }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1" />
          ))}
        </div>
        <TableSkeleton rows={10} cols={4} />
      </Card>
    </div>
  );
}
