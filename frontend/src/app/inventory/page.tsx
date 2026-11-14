import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/ui/PageSkeletons";
import { InventoryView } from "@/features/inventory/InventoryView";

export const metadata: Metadata = { title: "Inventario" };

export default function InventoryPage() {
  return (
    <Suspense fallback={<ListPageSkeleton filters={1} />}>
      <InventoryView />
    </Suspense>
  );
}
