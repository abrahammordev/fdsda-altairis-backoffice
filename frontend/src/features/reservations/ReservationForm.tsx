"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input, Select } from "@/components/ui/Form";
import { HotelPicker, type HotelRef } from "@/features/hotels/HotelPicker";
import { api, ApiError } from "@/lib/api";
import { addDays, fmt, today } from "@/lib/format";

/**
 * Alta de reserva: hotel → tipo de habitación → estancia → titular.
 * El backend comprueba la disponibilidad noche a noche; si no hay cupo, se muestra su mensaje.
 */
export function ReservationForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const [hotel, setHotel] = useState<HotelRef | null>(null);
  const [form, setForm] = useState({
    roomTypeId: "",
    checkIn: today(),
    checkOut: addDays(today(), 2),
    roomsCount: "1",
    holderName: "",
    holderEmail: "",
    holderPhone: "",
    status: "CONFIRMED" as "CONFIRMED" | "PENDING",
  });

  const roomTypes = useQuery({
    queryKey: ["roomTypes", hotel?.id],
    queryFn: () => api.roomTypes.byHotel(hotel!.id),
    enabled: !!hotel,
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.reservations.create({
        roomTypeId: form.roomTypeId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        roomsCount: Number(form.roomsCount),
        holderName: form.holderName,
        holderEmail: form.holderEmail,
        holderPhone: form.holderPhone || undefined,
        status: form.status,
      }),
    onSuccess: () => {
      for (const key of ["reservations", "dashboard", "inventory"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      onCreated();
    },
  });

  const fieldErrors = mutation.error instanceof ApiError ? mutation.error.fieldErrors : {};
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const selectedRoomType = roomTypes.data?.find((rt) => rt.id === form.roomTypeId);

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <Field label="Hotel" as="div" className="sm:col-span-2">
        <HotelPicker
          value={hotel}
          onChange={(h) => {
            setHotel(h);
            setForm((f) => ({ ...f, roomTypeId: "" }));
          }}
        />
      </Field>
      <Field label="Tipo de habitación" error={fieldErrors.roomTypeId} className="sm:col-span-2">
        <Select required value={form.roomTypeId} onChange={set("roomTypeId")} disabled={!roomTypes.data}>
          <option value="">{hotel ? "Selecciona un tipo…" : "Elige antes un hotel"}</option>
          {roomTypes.data?.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name} · {rt.capacity} pers. · desde {fmt.eurPrecise(rt.basePrice)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Entrada" error={fieldErrors.checkIn}>
        <Input type="date" required value={form.checkIn} onChange={set("checkIn")} />
      </Field>
      <Field label="Salida" error={fieldErrors.checkOut ?? fieldErrors.validStay}>
        <Input type="date" required min={addDays(form.checkIn, 1)} value={form.checkOut} onChange={set("checkOut")} />
      </Field>
      <Field label="Habitaciones" error={fieldErrors.roomsCount}>
        <Input type="number" min={1} max={50} required value={form.roomsCount} onChange={set("roomsCount")} />
      </Field>
      <Field label="Estado inicial" error={fieldErrors.status ?? fieldErrors.validInitialStatus}>
        <Select value={form.status} onChange={set("status")}>
          <option value="CONFIRMED">Confirmada</option>
          <option value="PENDING">Pendiente</option>
        </Select>
      </Field>
      <Field label="Titular de la reserva" error={fieldErrors.holderName} className="sm:col-span-2">
        <Input required value={form.holderName} onChange={set("holderName")} />
      </Field>
      <Field label="Email" error={fieldErrors.holderEmail}>
        <Input type="email" required value={form.holderEmail} onChange={set("holderEmail")} />
      </Field>
      <Field label="Teléfono (opcional)" error={fieldErrors.holderPhone}>
        <Input type="tel" value={form.holderPhone} onChange={set("holderPhone")} />
      </Field>
      <div className="sm:col-span-2">
        <FormError message={mutation.error && Object.keys(fieldErrors).length === 0 ? mutation.error.message : null} />
      </div>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <span className="text-xs text-slate-500">
          {selectedRoomType && "El precio final se calcula con la tarifa de cada noche."}
        </span>
        <Button type="submit" loading={mutation.isPending} disabled={!form.roomTypeId}>
          Registrar reserva
        </Button>
      </div>
    </form>
  );
}
