package com.altairis.backoffice.inventory.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Carga o actualiza la disponibilidad de un tipo de habitación para todas las fechas de
 * [from, to] (ambas incluidas). Si no se indica precio se usa el precio base del tipo.
 */
public record UpsertInventoryRequest(
        @NotNull LocalDate from,
        @NotNull LocalDate to,
        @NotNull @Min(0) @Max(10_000) Integer totalRooms,
        @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal price
) {
    public static final int MAX_DAYS = 366;

    @AssertTrue(message = "'to' debe ser igual o posterior a 'from' y el rango no puede superar 366 días")
    public boolean isValidRange() {
        return from == null || to == null
                || (!to.isBefore(from) && from.plusDays(MAX_DAYS).isAfter(to));
    }
}
