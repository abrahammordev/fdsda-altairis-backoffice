import { ChevronLeft, ChevronRight } from "lucide-react";
import { fmt } from "@/lib/format";
import { Button } from "./Button";

export function Pagination({
  page,
  totalPages,
  totalElements,
  onChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
      <span className="tabular">
        {fmt.int(totalElements)} resultados · página {totalPages === 0 ? 0 : page + 1} de {fmt.int(totalPages)}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden /> Anterior
        </Button>
        <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>
          Siguiente <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
