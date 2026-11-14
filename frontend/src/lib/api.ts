import type {
  ApiErrorBody,
  DashboardSummary,
  Hotel,
  HotelInput,
  HotelInventory,
  InventoryDay,
  InventoryInput,
  OccupancyPoint,
  Page,
  Reservation,
  ReservationInput,
  ReservationStatus,
  RoomType,
  RoomTypeInput,
  UUID,
} from "./types";

/** Error de la API con el cuerpo homogéneo del backend (ApiError). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | undefined | null>;

function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

const REQUEST_TIMEOUT_MS = 10_000;

const UNAVAILABLE = "El servidor no responde en este momento. Puede estar arrancando: inténtalo de nuevo en unos segundos.";

/**
 * Fallos transitorios que merece la pena reintentar: sin conexión, 5xx (p. ej. el backend arrancando
 * tras el proxy de Next), 408 y 429. Los 4xx son errores del usuario o de datos: reintentar no los arregla.
 */
export function isTransient(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.status === 0 || error.status >= 500 || error.status === 408 || error.status === 429;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  // Rutas relativas: Next reenvía /api/* al backend (ver next.config.ts)
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      // Si el backend no está, el proxy puede quedarse esperando: se corta y cuenta como fallo transitorio
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, UNAVAILABLE);
  }
  if (!res.ok) {
    // Si el backend no está, el proxy devuelve un 5xx sin el cuerpo JSON de ApiError
    const err = (await res.json().catch(() => null)) as ApiErrorBody | null;
    const fallback = res.status >= 500 ? UNAVAILABLE : `Error ${res.status}`;
    throw new ApiError(res.status, err?.message ?? fallback, err?.fieldErrors ?? {});
  }
  return res.json() as Promise<T>;
}

export const api = {
  hotels: {
    search: (q: { search?: string; country?: string; stars?: number; page?: number; size?: number; sort?: string }) =>
      request<Page<Hotel>>("GET", withQuery("/api/hotels", q)),
    get: (id: UUID) => request<Hotel>("GET", `/api/hotels/${id}`),
    create: (input: HotelInput) => request<Hotel>("POST", "/api/hotels", input),
  },
  roomTypes: {
    byHotel: (hotelId: UUID) => request<RoomType[]>("GET", `/api/hotels/${hotelId}/room-types`),
    create: (hotelId: UUID, input: RoomTypeInput) =>
      request<RoomType>("POST", `/api/hotels/${hotelId}/room-types`, input),
  },
  inventory: {
    byHotel: (hotelId: UUID, from: string, to: string) =>
      request<HotelInventory>("GET", withQuery(`/api/hotels/${hotelId}/inventory`, { from, to })),
    upsert: (roomTypeId: UUID, input: InventoryInput) =>
      request<InventoryDay[]>("PUT", `/api/room-types/${roomTypeId}/inventory`, input),
  },
  reservations: {
    search: (q: {
      search?: string;
      status?: ReservationStatus;
      hotelId?: UUID;
      from?: string;
      to?: string;
      page?: number;
      size?: number;
    }) => request<Page<Reservation>>("GET", withQuery("/api/reservations", q)),
    create: (input: ReservationInput) => request<Reservation>("POST", "/api/reservations", input),
    changeStatus: (id: UUID, status: ReservationStatus) =>
      request<Reservation>("PATCH", `/api/reservations/${id}/status`, { status }),
  },
  dashboard: {
    summary: () => request<DashboardSummary>("GET", "/api/dashboard/summary"),
    occupancy: (from?: string, to?: string) =>
      request<OccupancyPoint[]>("GET", withQuery("/api/dashboard/occupancy", { from, to })),
  },
};
