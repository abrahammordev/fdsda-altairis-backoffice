package com.altairis.backoffice.common.exception;

import java.util.UUID;

/** Recurso inexistente → HTTP 404. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public static NotFoundException of(String resource, UUID id) {
        return new NotFoundException(resource + " no encontrado: " + id);
    }
}
