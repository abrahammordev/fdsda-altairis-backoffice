"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { addDays, today as todayIso } from "@/lib/format";

export const WINDOW_DAYS = 21;

/** Inventario de un hotel en una ventana de 3 semanas que se puede desplazar. */
export function useHotelInventory(hotelId: string | undefined) {
  const today = todayIso();
  const [from, setFrom] = useState(today);
  const to = addDays(from, WINDOW_DAYS - 1);
  const dates = useMemo(() => Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(from, i)), [from]);

  const query = useQuery({
    queryKey: ["inventory", hotelId, from, to],
    queryFn: () => api.inventory.byHotel(hotelId!, from, to),
    enabled: !!hotelId,
    placeholderData: keepPreviousData,
  });

  return {
    query,
    from,
    to,
    dates,
    today,
    prev: () => setFrom((f) => addDays(f, -7)),
    next: () => setFrom((f) => addDays(f, 7)),
    reset: () => setFrom(today),
  };
}
