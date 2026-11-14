// Formato en español para cifras, importes y fechas

const LOCALE = "es-ES";

const integer = new Intl.NumberFormat(LOCALE);
const currency = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const currencyPrecise = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR" });
const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const fmt = {
  int: (n: number) => integer.format(n),
  pct: (n: number) => `${n.toLocaleString(LOCALE, { maximumFractionDigits: 1 })} %`,
  eur: (n: number) => currency.format(n),
  eurPrecise: (n: number) => currencyPrecise.format(n),
  eurCompact: (n: number) => compactCurrency.format(n),
};

/** "2026-11-14" → Date local (sin desfase de zona horaria). */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

export function today(): string {
  return toIsoDate(new Date());
}

/** "14 nov" */
export function shortDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
}

/** "vie 14 nov 2026" */
export function longDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "L", "M", "X"... para cabeceras de calendario */
export function weekdayLetter(iso: string): string {
  return ["D", "L", "M", "X", "J", "V", "S"][parseIsoDate(iso).getDay()];
}

export function isWeekend(iso: string): boolean {
  const day = parseIsoDate(iso).getDay();
  return day === 0 || day === 6;
}
