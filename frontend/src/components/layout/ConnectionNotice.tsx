"use client";

import { useIsFetching } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

/** Aviso discreto mientras alguna consulta reintenta tras un fallo (p. ej. el backend aún arrancando). */
export function ConnectionNotice() {
  const retrying = useIsFetching({ predicate: (q) => q.state.fetchFailureCount > 0 });
  if (retrying === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      Conectando con el servidor…
    </div>
  );
}
