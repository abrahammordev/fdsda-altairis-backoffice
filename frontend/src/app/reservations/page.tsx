import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/ui/PageSkeletons";
import { ReservationsView } from "@/features/reservations/ReservationsView";

export const metadata: Metadata = { title: "Reservas" };

export default function ReservationsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton filters={3} />}>
      <ReservationsView />
    </Suspense>
  );
}
