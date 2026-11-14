import clsx from "clsx";

const CONTROL =
  "block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-600 focus:outline-none disabled:bg-slate-50";

/**
 * Campo con etiqueta. Usa `as="div"` cuando el control es compuesto (buscadores con botones):
 * un <label> reenvía cada clic a su primer control y dispararía botones internos.
 */
export function Field({
  label,
  error,
  hint,
  className,
  as: Tag = "label",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  as?: "label" | "div";
  children: React.ReactNode;
}) {
  return (
    <Tag className={clsx("block", className)}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </Tag>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(CONTROL, className)} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(CONTROL, "pr-8", className)} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(CONTROL, className)} />;
}

/** Mensaje de error general del formulario (p. ej. 409 sin disponibilidad). */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
      {message}
    </p>
  );
}
