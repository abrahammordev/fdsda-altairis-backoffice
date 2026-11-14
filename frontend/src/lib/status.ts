import type { ReservationStatus } from "./types";

/** Tinta y rejilla de las gráficas (recesivas para que destaquen los datos). */
export const CHART = {
  primary: "#2a78d6",
  secondary: "#eb6834",
  grid: "#e1e0d9",
  axis: "#898781",
  ink: "#0b0b0b",
  inkSecondary: "#52514e",
};

/**
 * Estados de reserva: colores de estado fijos (bien / aviso / crítico).
 * Siempre se muestran junto a su etiqueta, nunca el color solo.
 */
export const STATUS: Record<ReservationStatus, { label: string; color: string; badge: string }> = {
  CONFIRMED: { label: "Confirmada", color: "#0ca30c", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  PENDING: { label: "Pendiente", color: "#fab219", badge: "bg-amber-50 text-amber-800 ring-amber-200" },
  CANCELLED: { label: "Cancelada", color: "#d03b3b", badge: "bg-rose-50 text-rose-800 ring-rose-200" },
};

export const STATUS_ORDER: ReservationStatus[] = ["CONFIRMED", "PENDING", "CANCELLED"];

/** Ocupación (magnitud) en una sola gama de azul, de claro a oscuro. */
export const OCCUPANCY_SCALE = [
  { max: 25, label: "0–25 %", bg: "#cde2fb", fg: "#0b0b0b" },
  { max: 50, label: "25–50 %", bg: "#9ec5f4", fg: "#0b0b0b" },
  { max: 75, label: "50–75 %", bg: "#5598e7", fg: "#ffffff" },
  { max: 99.9, label: "75–99 %", bg: "#256abf", fg: "#ffffff" },
  { max: 100, label: "Completo", bg: "#0d366b", fg: "#ffffff" },
] as const;

export const NO_INVENTORY = { bg: "#f0efec", fg: "#898781" };

export function occupancyColor(pct: number, total: number): { bg: string; fg: string } {
  if (total === 0) return NO_INVENTORY;
  return OCCUPANCY_SCALE.find((s) => pct <= s.max) ?? OCCUPANCY_SCALE[OCCUPANCY_SCALE.length - 1];
}
