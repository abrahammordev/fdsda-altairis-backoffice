"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Hoy" },
  { href: "/reservations", label: "Reservas" },
  { href: "/inventory", label: "Inventario" },
  { href: "/hotels", label: "Hoteles" },
] as const;

/** Pestañas de sección: la activa se marca con un subrayado bajo el texto. */
export function NavLinks({ highlightActive = false }: { highlightActive?: boolean }) {
  return (
    <nav className="-mb-px flex h-full min-w-0 gap-1 overflow-x-auto" aria-label="Secciones">
      {highlightActive ? <ActiveLinks /> : NAV.map((item) => <NavItem key={item.href} {...item} active={false} />)}
    </nav>
  );
}

function ActiveLinks() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return NAV.map((item) => <NavItem key={item.href} {...item} active={isActive(item.href)} />);
}

function NavItem({ href, label, active }: (typeof NAV)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors",
        active ? "border-teal-700 text-slate-900" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
      )}
    >
      {label}
    </Link>
  );
}
