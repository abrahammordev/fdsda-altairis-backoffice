"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/States";
import { api } from "@/lib/api";
import { HotelPicker, type HotelRef } from "@/features/hotels/HotelPicker";
import { InventoryPanel } from "./InventoryPanel";

/** Consulta rápida de disponibilidad: elegir hotel y ver su calendario de ocupación. */
export function InventoryView() {
  const [hotel, setHotel] = useState<HotelRef | null>(null);

  // Accesos rápidos: hoteles con reservas recientes (tienen inventario cargado)
  const suggestions = useQuery({
    queryKey: ["reservations", "recent-hotels"],
    queryFn: async () => {
      const page = await api.reservations.search({ size: 50 });
      const unique = new Map(page.content.map((r) => [r.hotelId, { id: r.hotelId, name: r.hotelName }]));
      return [...unique.values()].slice(0, 6);
    },
  });

  return (
    <>
      <PageHeader title="Inventario" subtitle="Disponibilidad diaria por hotel y tipo de habitación" />
      <Card className="mb-6">
        <CardHeader title="Hotel" subtitle="Busca un hotel para ver su calendario de disponibilidad" />
        <div className="max-w-xl">
          <HotelPicker value={hotel} onChange={setHotel} />
        </div>
        {!hotel && suggestions.data && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Accesos rápidos:</span>
            {suggestions.data.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHotel(h)}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200"
              >
                {h.name}
              </button>
            ))}
          </div>
        )}
      </Card>
      {hotel && (
        <InventoryPanel
          key={hotel.id}
          hotelId={hotel.id}
          action={
            <Link href={`/hotels/${hotel.id}`} className="ml-2 text-sm font-medium text-teal-700 hover:text-teal-800">
              Ficha del hotel
            </Link>
          }
        />
      )}
    </>
  );
}
