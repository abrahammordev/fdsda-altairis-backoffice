package es.viajesaltairis.backoffice.reservation.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Edición de una reserva activa: titular, fechas y número de habitaciones.
 * El tipo de habitación (y por tanto el hotel) no cambia; el estado se cambia con PATCH /status.
 */
public record UpdateReservationRequest(
        @NotBlank @Size(max = 150) String holderName,
        @NotBlank @Email @Size(max = 150) String holderEmail,
        @Size(max = 30) String holderPhone,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @NotNull @Min(1) @Max(50) Integer roomsCount
) {
    @AssertTrue(message = "checkOut debe ser posterior a checkIn y la estancia no puede superar 60 noches")
    public boolean isValidStay() {
        return checkIn == null || checkOut == null
                || (checkOut.isAfter(checkIn) && !checkOut.isAfter(checkIn.plusDays(60)));
    }
}
