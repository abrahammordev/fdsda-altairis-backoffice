"use client";

import { Button } from "./Button";
import { FormError } from "./Form";
import { Modal } from "./Modal";

/**
 * Sustituto de window.confirm sobre <dialog> nativo. Sigue abierto mientras la acción se ejecuta
 * y, si falla, muestra el error dentro en lugar de cerrarse.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Volver",
  tone = "primary",
  loading,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" role="alertdialog">
      <div className="text-sm text-slate-600">{message}</div>
      {error && (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant={tone === "danger" ? "dangerSolid" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/** Sustituto de window.alert sobre <dialog> nativo: mensaje y un único botón para cerrar. */
export function MessageDialog({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" role="alertdialog">
      <div className="text-sm text-slate-600">{message}</div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} autoFocus>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
