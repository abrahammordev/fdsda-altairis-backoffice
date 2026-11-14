"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/Form";
import { api, ApiError } from "@/lib/api";
import type { Hotel } from "@/lib/types";

/** Alta de hotel. Muestra los errores de validación del backend junto a cada campo. */
export function HotelForm({ onCreated }: { onCreated: (hotel: Hotel) => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", address: "", city: "", country: "España", stars: "4", description: "" });

  const mutation = useMutation({
    mutationFn: () => api.hotels.create({ ...form, stars: Number(form.stars), description: form.description || undefined }),
    onSuccess: (hotel) => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onCreated(hotel);
    },
  });

  const fieldErrors = mutation.error instanceof ApiError ? mutation.error.fieldErrors : {};
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
        <Input required value={form.name} onChange={set("name")} placeholder="Hotel Gran Vía" />
      </Field>
      <Field label="Dirección" error={fieldErrors.address} className="sm:col-span-2">
        <Input required value={form.address} onChange={set("address")} placeholder="Calle Mayor, 1" />
      </Field>
      <Field label="Ciudad" error={fieldErrors.city}>
        <Input required value={form.city} onChange={set("city")} />
      </Field>
      <Field label="País" error={fieldErrors.country}>
        <Input required value={form.country} onChange={set("country")} />
      </Field>
      <Field label="Categoría" error={fieldErrors.stars}>
        <Select value={form.stars} onChange={set("stars")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "estrella" : "estrellas"}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Descripción (opcional)" error={fieldErrors.description} className="sm:col-span-2">
        <Textarea rows={3} value={form.description} onChange={set("description")} />
      </Field>
      <div className="sm:col-span-2">
        <FormError message={mutation.error && Object.keys(fieldErrors).length === 0 ? mutation.error.message : null} />
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" loading={mutation.isPending}>
          Crear hotel
        </Button>
      </div>
    </form>
  );
}
