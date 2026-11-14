package es.viajesaltairis.backoffice.reservation.dto;

import es.viajesaltairis.backoffice.reservation.ReservationStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Alta de reserva. {@code status} es opcional: PENDING o CONFIRMED (por defecto CONFIRMED).
 */
public record CreateReservationRequest(
        @NotNull UUID roomTypeId,
        @NotBlank @Size(max = 150) String holderName,
        @NotBlank @Email @Size(max = 150) String holderEmail,
        @Size(max = 30) String holderPhone,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @NotNull @Min(1) @Max(50) Integer roomsCount,
        ReservationStatus status
) {
    @AssertTrue(message = "checkOut debe ser posterior a checkIn y la estancia no puede superar 60 noches")
    public boolean isValidStay() {
        return checkIn == null || checkOut == null
                || (checkOut.isAfter(checkIn) && !checkOut.isAfter(checkIn.plusDays(60)));
    }

    @AssertTrue(message = "El estado inicial solo puede ser PENDING o CONFIRMED")
    public boolean isValidInitialStatus() {
        return status == null || status != ReservationStatus.CANCELLED;
    }
}
