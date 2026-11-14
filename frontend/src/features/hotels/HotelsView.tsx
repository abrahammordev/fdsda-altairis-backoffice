"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stars } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useDebounced } from "@/lib/hooks";
import { HotelForm } from "./HotelForm";

const PAGE_SIZE = 20;

export function HotelsView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stars, setStars] = useState("");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const debouncedSearch = useDebounced(search);

  const hotels = useQuery({
    queryKey: ["hotels", { search: debouncedSearch, stars, page }],
    queryFn: () =>
      api.hotels.search({ search: debouncedSearch, stars: stars ? Number(stars) : undefined, page, size: PAGE_SIZE, sort: "name" }),
    placeholderData: keepPreviousData, // la tabla no parpadea al cambiar de página
  });

  return (
    <>
      <PageHeader
        title="Hoteles"
        subtitle="Catálogo de hoteles y sus tipos de habitación"
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden /> Nuevo hotel
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              type="search"
              aria-label="Buscar hotel"
              placeholder="Nombre del hotel o ciudad…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <Select
            aria-label="Filtrar por categoría"
            className="sm:w-48"
            value={stars}
            onChange={(e) => {
              setStars(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todas las categorías</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrellas
              </option>
            ))}
          </Select>
        </div>

        {hotels.isError ? (
          <ErrorState message={hotels.error.message} onRetry={() => hotels.refetch()} />
        ) : !hotels.data ? (
          <TableSkeleton rows={10} cols={4} />
        ) : hotels.data.content.length === 0 ? (
          <EmptyState title="No hay hoteles que coincidan" description="Prueba con otro texto o quita el filtro de categoría." />
        ) : (
          <>
            <div className={hotels.isFetching ? "opacity-60 transition-opacity" : undefined}>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Hotel</th>
                    <th className="hidden py-2 pr-4 font-medium sm:table-cell">Ubicación</th>
                    <th className="py-2 font-medium">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotels.data.content.map((h) => (
                    <tr key={h.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/hotels/${h.id}`)}>
                      <td className="py-3 pr-4">
                        <Link href={`/hotels/${h.id}`} className="font-medium text-slate-900 hover:text-teal-800">
                          {h.name}
                        </Link>
                        <p className="text-xs text-slate-500 sm:hidden">
                          {h.city}, {h.country}
                        </p>
                      </td>
                      <td className="hidden py-3 pr-4 text-slate-600 sm:table-cell">
                        {h.city}, {h.country}
                      </td>
                      <td className="py-3">
                        <Stars count={h.stars} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={hotels.data.page}
              totalPages={hotels.data.totalPages}
              totalElements={hotels.data.totalElements}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo hotel">
        <HotelForm
          onCreated={(hotel) => {
            setCreating(false);
            router.push(`/hotels/${hotel.id}`);
          }}
        />
      </Modal>
    </>
  );
}
