package es.viajesaltairis.backoffice.common.dto;

import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;

/** Respuesta paginada estable para el frontend (no expone la estructura interna de Spring). */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
