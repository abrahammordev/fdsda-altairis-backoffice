"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Ban, Check, Plus, Search } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog, MessageDialog } from "@/components/ui/Dialogs";
import { Input } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/States";
import { api } from "@/lib/api";
import { fmt, shortDate } from "@/lib/format";
import { useDebounced } from "@/lib/hooks";
import { STATUS, STATUS_ORDER } from "@/lib/status";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { ReservationForm } from "./ReservationForm";

const PAGE_SIZE = 20;

export function ReservationsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReservationStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const debouncedSearch = useDebounced(search);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  const reservations = useQuery({
    queryKey: ["reservations", { search: debouncedSearch, status, from, to, page }],
    queryFn: () =>
      api.reservations.search({
        search: debouncedSearch,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  // Reserva pendiente de confirmar su cancelación y error de un cambio de estado directo
  const [toCancel, setToCancel] = useState<Reservation | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const changeStatus = useMutation({
    mutationFn: ({ id, target }: { id: string; target: ReservationStatus }) => api.reservations.changeStatus(id, target),
    onSuccess: () => {
      for (const key of ["reservations", "dashboard", "inventory"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      setToCancel(null);
    },
    // Al cancelar, el error se ve dentro del diálogo de confirmación; al confirmar, en un aviso
    onError: (err, { target }) => {
      if (target !== "CANCELLED") setStatusError(err.message);
    },
  });

  const closeCancelDialog = () => {
    setToCancel(null);
    changeStatus.reset();
  };

  return (
    <>
      <PageHeader
        title="Reservas"
        subtitle="Registro y seguimiento de reservas"
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden /> Nueva reserva
          </Button>
        }
      />

      <Card>
        {/* Filtros en una sola fila */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              type="search"
              aria-label="Buscar titular"
              placeholder="Titular o email…"
              className="pl-9"
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Filtrar por estado">
            {(["", ...STATUS_ORDER] as const).map((s) => (
              <button
                key={s || "all"}
                type="button"
                aria-pressed={status === s}
                onClick={() => resetPage(setStatus)(s)}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  status === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {s ? STATUS[s].label : "Todas"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Input type="date" aria-label="Estancias desde" value={from} onChange={(e) => resetPage(setFrom)(e.target.value)} />
            <span>–</span>
            <Input type="date" aria-label="Estancias hasta" value={to} min={from} onChange={(e) => resetPage(setTo)(e.target.value)} />
          </div>
        </div>

        {reservations.isError ? (
          <ErrorState message={reservations.error.message} onRetry={() => reservations.refetch()} />
        ) : !reservations.data ? (
          <TableSkeleton rows={10} cols={6} />
        ) : reservations.data.content.length === 0 ? (
          <EmptyState title="No hay reservas con estos filtros" />
        ) : (
          <>
            <div className={clsx("overflow-x-auto", reservations.isFetching && "opacity-60 transition-opacity")}>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Titular</th>
                    <th className="py-2 pr-4 font-medium">Hotel · habitación</th>
                    <th className="py-2 pr-4 font-medium">Estancia</th>
                    <th className="py-2 pr-4 text-right font-medium">Hab.</th>
                    <th className="py-2 pr-4 text-right font-medium">Importe</th>
                    <th className="py-2 pr-4 font-medium">Estado</th>
                    <th className="py-2 font-medium">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.data.content.map((r) => (
                    <tr key={r.id} className="align-top">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{r.holderName}</p>
                        <p className="text-xs text-slate-500">{r.holderEmail}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-slate-900">{r.hotelName}</p>
                        <p className="text-xs text-slate-500">{r.roomTypeName}</p>
                      </td>
                      <td className="tabular py-3 pr-4 whitespace-nowrap">
                        <p className="text-slate-900">
                          {shortDate(r.checkIn)} → {shortDate(r.checkOut)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.nights} {r.nights === 1 ? "noche" : "noches"}
                        </p>
                      </td>
                      <td className="tabular py-3 pr-4 text-right">{r.roomsCount}</td>
                      <td className="tabular py-3 pr-4 text-right font-medium">{fmt.eurPrecise(r.totalPrice)}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1.5">
                          {r.status === "PENDING" && (
                            <Button size="sm" variant="secondary" onClick={() => changeStatus.mutate({ id: r.id, target: "CONFIRMED" })} disabled={changeStatus.isPending}>
                              <Check className="size-3.5" aria-hidden /> Confirmar
                            </Button>
                          )}
                          {r.status !== "CANCELLED" && (
                            <Button size="sm" variant="danger" onClick={() => setToCancel(r)} disabled={changeStatus.isPending}>
                              <Ban className="size-3.5" aria-hidden /> Cancelar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={reservations.data.page}
              totalPages={reservations.data.totalPages}
              totalElements={reservations.data.totalElements}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={toCancel !== null}
        title="Cancelar reserva"
        message={
          toCancel && (
            <>
              <p>
                Se cancelará la reserva de <strong className="text-slate-900">{toCancel.holderName}</strong> en{" "}
                {toCancel.hotelName} ({shortDate(toCancel.checkIn)} → {shortDate(toCancel.checkOut)}).
              </p>
              <p className="mt-2">
                {toCancel.roomsCount === 1 ? "La habitación vuelve" : `Las ${toCancel.roomsCount} habitaciones vuelven`} al
                inventario. Esta acción no se puede deshacer.
              </p>
            </>
          )
        }
        confirmLabel="Cancelar reserva"
        tone="danger"
        loading={changeStatus.isPending}
        error={toCancel && changeStatus.isError ? changeStatus.error.message : null}
        onConfirm={() => toCancel && changeStatus.mutate({ id: toCancel.id, target: "CANCELLED" })}
        onClose={closeCancelDialog}
      />
      <MessageDialog
        open={statusError !== null}
        title="No se ha podido actualizar la reserva"
        message={statusError}
        onClose={() => setStatusError(null)}
      />

      <Modal open={creating} onClose={() => setCreating(false)} title="Nueva reserva">
        <ReservationForm onCreated={() => setCreating(false)} />
      </Modal>
    </>
  );
}
