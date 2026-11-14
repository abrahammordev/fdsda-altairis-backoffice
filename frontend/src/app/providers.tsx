"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isTransient } from "@/lib/api";

/** Reintentos ante fallos transitorios: 1 s, 2 s, 4 s y luego cada 5 s (unos 30 s en total). */
const MAX_RETRIES = 8;

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Mientras se reintenta, la consulta sigue "cargando" y se mantiene el skeleton
        retry: (failureCount, error) => isTransient(error) && failureCount < MAX_RETRIES,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      },
    },
  });
}

function getQueryClient() {
  // Un cliente por render en servidor (aislado) y uno compartido en el navegador (conserva la caché)
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
