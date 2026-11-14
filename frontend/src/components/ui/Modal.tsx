"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Diálogo modal sobre <dialog> nativo (foco, Escape y fondo gestionados por el navegador).
 * Se cierra al salir de la página: Next conserva el estado de las rutas ocultas (Activity).
 */
export function Modal({
  open,
  onClose,
  title,
  size = "md",
  role,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** "sm" para confirmaciones y avisos; "md" para formularios */
  size?: "sm" | "md";
  /** "alertdialog" cuando el diálogo exige una respuesta (confirmaciones, errores) */
  role?: "alertdialog";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Al ocultarse la ruta, cerrar: volver a la página no debe encontrar el diálogo abierto
  useLayoutEffect(() => () => onCloseRef.current(), []);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={clsx(
        "m-auto rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/40",
        size === "sm" ? "w-[min(92vw,26rem)]" : "w-[min(92vw,34rem)]",
      )}
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
