import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/ui/PageSkeletons";
import { HotelsView } from "@/features/hotels/HotelsView";

export const metadata: Metadata = { title: "Hoteles" };

export default function HotelsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <HotelsView />
    </Suspense>
  );
}
