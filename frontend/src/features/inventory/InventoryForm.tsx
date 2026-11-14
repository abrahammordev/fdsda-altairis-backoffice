"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input, Select } from "@/components/ui/Form";
import { api, ApiError } from "@/lib/api";
import { addDays, fmt, today } from "@/lib/format";
import type { RoomType } from "@/lib/types";

/** Carga o actualiza la disponibilidad de un tipo de habitación en un rango de fechas. */
export function InventoryForm({ roomTypes, onSaved }: { roomTypes: RoomType[]; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    roomTypeId: roomTypes[0]?.id ?? "",
    from: today(),
    to: addDays(today(), 29),
    totalRooms: "10",
    price: "",
  });
  const selected = roomTypes.find((rt) => rt.id === form.roomTypeId);

  const mutation = useMutation({
    mutationFn: () =>
      api.inventory.upsert(form.roomTypeId, {
        from: form.from,
        to: form.to,
        totalRooms: Number(form.totalRooms),
        price: form.price ? Number(form.price) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onSaved();
    },
  });

  const fieldErrors = mutation.error instanceof ApiError ? mutation.error.fieldErrors : {};
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <Field label="Tipo de habitación" className="sm:col-span-2">
        <Select value={form.roomTypeId} onChange={set("roomTypeId")}>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Desde" error={fieldErrors.from}>
        <Input type="date" required value={form.from} onChange={set("from")} />
      </Field>
      <Field label="Hasta (incluido)" error={fieldErrors.to ?? fieldErrors.validRange}>
        <Input type="date" required min={form.from} value={form.to} onChange={set("to")} />
      </Field>
      <Field label="Habitaciones totales" error={fieldErrors.totalRooms} hint="Se conservan las ya reservadas">
        <Input type="number" min={0} required value={form.totalRooms} onChange={set("totalRooms")} />
      </Field>
      <Field
        label="Precio por noche (opcional)"
        error={fieldErrors.price}
        hint={selected ? `Si se deja vacío: ${fmt.eurPrecise(selected.basePrice)} (precio base)` : undefined}
      >
        <Input type="number" min={0} step="0.01" value={form.price} onChange={set("price")} />
      </Field>
      <div className="sm:col-span-2">
        <FormError message={mutation.error && Object.keys(fieldErrors).length === 0 ? mutation.error.message : null} />
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" loading={mutation.isPending} disabled={!form.roomTypeId}>
          Guardar disponibilidad
        </Button>
      </div>
    </form>
  );
}
