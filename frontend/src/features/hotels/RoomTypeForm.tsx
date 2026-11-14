"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input } from "@/components/ui/Form";
import { api, ApiError } from "@/lib/api";

export function RoomTypeForm({ hotelId, onCreated }: { hotelId: string; onCreated: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", capacity: "2", basePrice: "", description: "" });

  const mutation = useMutation({
    mutationFn: () =>
      api.roomTypes.create(hotelId, {
        name: form.name,
        capacity: Number(form.capacity),
        basePrice: Number(form.basePrice),
        description: form.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", hotelId] });
      onCreated();
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
      <div className="sm:col-span-2">
        <FormError message={mutation.error && Object.keys(fieldErrors).length === 0 ? mutation.error.message : null} />
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" loading={mutation.isPending}>
          Añadir tipo
        </Button>
      </div>
    </form>
  );
}
