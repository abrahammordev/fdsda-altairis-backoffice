package com.altairis.backoffice.common.exception;

import java.time.Instant;
import java.util.Map;

/**
 * Cuerpo de error homogéneo para todas las respuestas no exitosas de la API.
 *
 * @param fieldErrors errores de validación por campo (vacío si no aplica)
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path, Map.of());
    }
}
