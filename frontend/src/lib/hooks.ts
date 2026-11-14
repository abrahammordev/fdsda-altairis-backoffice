"use client";

import { useEffect, useState } from "react";

/** Devuelve el valor tras `delay` ms sin cambios (búsquedas mientras se escribe). */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
