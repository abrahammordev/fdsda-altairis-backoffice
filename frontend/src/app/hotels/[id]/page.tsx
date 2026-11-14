import type { Metadata } from "next";
import { Suspense } from "react";
import { HotelDetailSkeleton, HotelDetailView } from "@/features/hotels/HotelDetailView";

export const metadata: Metadata = { title: "Hotel" };

// El id solo se conoce en la petición: con Cache Components, leerlo exige un límite de Suspense.
export default function HotelDetailPage() {
  return (
    <Suspense fallback={<HotelDetailSkeleton />}>
      <HotelDetailView />
    </Suspense>
  );
}
