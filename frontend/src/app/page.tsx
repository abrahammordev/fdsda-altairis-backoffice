import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/PageSkeletons";
import { DashboardView } from "@/features/dashboard/DashboardView";

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
