import Link from "next/link";
import { Suspense } from "react";
import { NavLinks } from "./NavLinks";

/**
 * Cabecera fija con la marca y las secciones como pestañas.
 * El enlace activo depende de la URL, que en rutas dinámicas solo se conoce en la petición:
 * por eso va en Suspense, con las mismas pestañas sin resaltar mientras tanto.
 */
export function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-slate-900">Altairis</span>
          <span className="hidden text-xs font-medium tracking-widest text-teal-700 uppercase sm:inline">Operaciones</span>
        </Link>
        <Suspense fallback={<NavLinks />}>
          <NavLinks highlightActive />
        </Suspense>
      </div>
    </header>
  );
}
