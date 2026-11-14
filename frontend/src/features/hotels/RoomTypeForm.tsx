"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input } from "@/components/ui/Form";
import { api, ApiError } from "@/lib/api";
import type { RoomType, RoomTypeInput } from "@/lib/types";

/** Alta de un tipo de habitación o, si recibe `roomType`, edición del existente. */
export function RoomTypeForm({
  hotelId,
  roomType,
  onSaved,
}: {
  hotelId: string;
  roomType?: RoomType;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: roomType?.name ?? "",
    capacity: String(roomType?.capacity ?? 2),
    basePrice: roomType ? String(roomType.basePrice) : "",
    description: roomType?.description ?? "",
  });

  const mutation = useMutation({
    mutationFn: () => {
      const input: RoomTypeInput = {
        name: form.name,
        capacity: Number(form.capacity),
        basePrice: Number(form.basePrice),
        description: form.description || undefined,
      };
      return roomType ? api.roomTypes.update(roomType.id, input) : api.roomTypes.create(hotelId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", hotelId] });
      // El nombre del tipo aparece en el listado de reservas.
      if (roomType) queryClient.invalidateQueries({ queryKey: ["reservations"] });
      onSaved();
    },
  });

  const fieldErrors = mutation.error instanceof ApiError ? mutation.error.fieldErrors : {};
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <Field label="Nombre" error={fieldErrors.name} className="sm:col-span-2">
        <Input required value={form.name} onChange={set("name")} placeholder="Doble superior" />
      </Field>
      <Field label="Capacidad (personas)" error={fieldErrors.capacity}>
        <Input type="number" min={1} max={20} required value={form.capacity} onChange={set("capacity")} />
      </Field>
      <Field label="Precio base por noche (€)" error={fieldErrors.basePrice}>
        <Input type="number" min={0} step="0.01" required value={form.basePrice} onChange={set("basePrice")} />
      </Field>
      <Field label="Descripción (opcional)" error={fieldErrors.description} className="sm:col-span-2">
        <Input value={form.description} onChange={set("description")} />
      </Field>
      {roomType && (
        <p className="text-xs text-slate-500 sm:col-span-2">
          El nuevo precio base se aplicará en las próximas cargas de disponibilidad; no cambia las noches ya cargadas ni las reservas existentes.
        </p>
      )}
      <div className="sm:col-span-2">
        <FormError message={mutation.error && Object.keys(fieldErrors).length === 0 ? mutation.error.message : null} />
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" loading={mutation.isPending}>
          {roomType ? "Guardar cambios" : "Añadir tipo"}
        </Button>
      </div>
    </form>
  );
}
