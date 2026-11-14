"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useId, useState } from "react";
import { Input } from "@/components/ui/Form";
import { api } from "@/lib/api";
import { useDebounced } from "@/lib/hooks";
import type { Hotel } from "@/lib/types";

/** Lo mínimo para identificar un hotel elegido (la ciudad es opcional). */
export type HotelRef = Pick<Hotel, "id" | "name"> & Partial<Pick<Hotel, "city">>;

/** Buscador de hotel con sugerencias (hay miles: no cabe en un <select>). */
export function HotelPicker({
  value,
  onChange,
  placeholder = "Escribe el hotel o la ciudad…",
}: {
  value: HotelRef | null;
  onChange: (hotel: HotelRef | null) => void;
  placeholder?: string;
}) {
  const listId = useId();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const search = useDebounced(text, 250);

  const results = useQuery({
    queryKey: ["hotels", "picker", search],
    queryFn: () => api.hotels.search({ search, size: 8, sort: "name" }),
    enabled: open,
  });

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-sm ring-1 ring-teal-200">
        <span className="min-w-0 truncate">
          <span className="font-medium text-teal-900">{value.name}</span>
          {value.city && <span className="text-teal-800"> · {value.city}</span>}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 rounded p-0.5 text-teal-800 hover:bg-teal-100"
          aria-label="Cambiar hotel"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <Input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Hotel"
        className="pl-9"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
        >
          {results.isPending && <li className="px-3 py-2 text-slate-500">Buscando…</li>}
          {results.data?.content.length === 0 && <li className="px-3 py-2 text-slate-500">Sin resultados</li>}
          {results.data?.content.map((h) => (
            <li
              key={h.id}
              role="option"
              aria-selected={false}
              className="cursor-pointer px-3 py-2 hover:bg-slate-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(h);
                setText("");
                setOpen(false);
              }}
            >
              <span className="font-medium text-slate-900">{h.name}</span>
              <span className="text-slate-500"> · {h.city}, {h.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
