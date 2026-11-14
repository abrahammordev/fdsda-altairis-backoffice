"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input } from "@/components/ui/Form";
import { api, ApiError } from "@/lib/api";
import { addDays, fmt } from "@/lib/format";
import type { Reservation } from "@/lib/types";

/**
 * Edición de una reserva activa: titular, fechas y habitaciones. El hotel y el tipo no cambian.
 * Si cambia la estancia, el backend devuelve las noches anteriores al inventario, reserva las nuevas
 * y recalcula el importe; si no hay cupo, la reserva queda como estaba y se muestra el motivo.
 */
export function EditReservationForm({ reservation, onSaved }: { reservation: Reservation; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    roomsCount: String(reservation.roomsCount),
    holderName: reservation.holderName,
    holderEmail: reservation.holderEmail,
    holderPhone: reservation.holderPhone ?? "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.reservations.update(reservation.id, {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        roomsCount: Number(form.roomsCount),
        holderName: form.holderName,
        holderEmail: form.holderEmail,
        holderPhone: form.holderPhone || undefined,
      }),
    onSuccess: () => {
      for (const key of ["reservations", "dashboard", "inventory"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      onSaved();
    },
  });

  const fieldErrors = mutation.error instanceof ApiError ? mutation.error.fieldErrors : {};
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const stayChanged =
    form.checkIn !== reservation.checkIn ||
    form.checkOut !== reservation.checkOut ||
    Number(form.roomsCount) !== reservation.roomsCount;

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm sm:col-span-2">
        <p className="font-medium text-slate-900">{reservation.hotelName}</p>
        <p className="text-slate-500">{reservation.roomTypeName}</p>
      </div>
      <Field label="Entrada" error={fieldErrors.checkIn}>
        <Input type="date" required value={form.checkIn} onChange={set("checkIn")} />
      </Field>
      <Field label="Salida" error={fieldErrors.checkOut ?? fieldErrors.validStay}>
        <Input type="date" required min={addDays(form.checkIn, 1)} value={form.checkOut} onChange={set("checkOut")} />
      </Field>
      <Field label="Habitaciones" error={fieldErrors.roomsCount} className="sm:col-span-2">
        <Input type="number" min={1} max={50} required value={form.roomsCount} onChange={set("roomsCount")} />
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
          {stayChanged
            ? "Se comprobará la disponibilidad y se recalculará el importe con la tarifa de cada noche."
            : `Importe actual: ${fmt.eurPrecise(reservation.totalPrice)}`}
        </span>
        <Button type="submit" loading={mutation.isPending}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
