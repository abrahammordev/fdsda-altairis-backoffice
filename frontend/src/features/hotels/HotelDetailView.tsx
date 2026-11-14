"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin, Pencil, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Stars } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { InventoryCalendarSkeleton } from "@/features/inventory/InventoryCalendar";
import { InventoryForm } from "@/features/inventory/InventoryForm";
import { InventoryPanel } from "@/features/inventory/InventoryPanel";
import { api } from "@/lib/api";
import { fmt } from "@/lib/format";
import type { RoomType } from "@/lib/types";
import { RoomTypeForm } from "./RoomTypeForm";

export function HotelDetailView() {
  const { id } = useParams<{ id: string }>();
  const hotel = useQuery({ queryKey: ["hotels", id], queryFn: () => api.hotels.get(id) });
  const roomTypes = useQuery({ queryKey: ["roomTypes", id], queryFn: () => api.roomTypes.byHotel(id) });
  const [modal, setModal] = useState<"roomType" | "inventory" | null>(null);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const close = () => setModal(null);

  if (hotel.isError) {
    return (
      <Card>
        <ErrorState message={hotel.error.message} onRetry={() => hotel.refetch()} />
      </Card>
    );
  }

  return (
    <>
      <Link href="/hotels" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ChevronLeft className="size-4" aria-hidden /> Hoteles
      </Link>

      {!hotel.data ? (
        <HotelHeaderSkeleton />
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{hotel.data.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <Stars count={hotel.data.stars} />
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4 text-slate-400" aria-hidden />
              {hotel.data.address} · {hotel.data.city}, {hotel.data.country}
            </span>
          </p>
          {hotel.data.description && <p className="mt-2 max-w-3xl text-sm text-slate-500">{hotel.data.description}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader
            title="Tipos de habitación"
            action={
              <Button variant="secondary" size="sm" onClick={() => setModal("roomType")}>
                <Plus className="size-4" aria-hidden /> Añadir tipo
              </Button>
            }
          />
          {roomTypes.isError ? (
            <ErrorState message={roomTypes.error.message} onRetry={() => roomTypes.refetch()} />
          ) : !roomTypes.data ? (
            <TableSkeleton rows={3} cols={3} />
          ) : roomTypes.data.length === 0 ? (
            <EmptyState title="Sin tipos de habitación" description="Añade el primero para poder cargar disponibilidad." />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {roomTypes.data.map((rt) => (
                <li key={rt.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900">{rt.name}</p>
                    <button
                      type="button"
                      onClick={() => setEditing(rt)}
                      className="-m-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Editar ${rt.name}`}
                      title="Editar"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <Users className="size-3.5" aria-hidden /> {rt.capacity} {rt.capacity === 1 ? "persona" : "personas"}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {fmt.eurPrecise(rt.basePrice)} <span className="text-sm font-normal text-slate-500">/ noche</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {roomTypes.data ? (
          <InventoryPanel
            hotelId={id}
            action={
              roomTypes.data.length > 0 && (
                <Button size="sm" onClick={() => setModal("inventory")}>
                  Cargar disponibilidad
                </Button>
              )
            }
          />
        ) : (
          <Card>
            <InventoryCalendarSkeleton />
          </Card>
        )}
      </div>

      <Modal open={modal === "roomType"} onClose={close} title="Nuevo tipo de habitación">
        <RoomTypeForm hotelId={id} onSaved={close} />
      </Modal>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar tipo de habitación">
        {editing && <RoomTypeForm key={editing.id} hotelId={id} roomType={editing} onSaved={() => setEditing(null)} />}
      </Modal>
      <Modal open={modal === "inventory"} onClose={close} title="Cargar disponibilidad">
        {roomTypes.data && <InventoryForm roomTypes={roomTypes.data} onSaved={close} />}
      </Modal>
    </>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="mb-4 h-4 w-20" />
      <HotelHeaderSkeleton />
      <Card className="mb-6">
        <TableSkeleton rows={3} cols={3} />
      </Card>
      <Card>
        <InventoryCalendarSkeleton />
      </Card>
    </div>
  );
}

function HotelHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2" aria-hidden>
      <Skeleton className="h-7 w-72" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}
