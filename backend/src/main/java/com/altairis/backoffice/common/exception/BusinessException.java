package com.altairis.backoffice.common.exception;

/** Violación de una regla de negocio (p. ej. sin disponibilidad) → HTTP 409. */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
