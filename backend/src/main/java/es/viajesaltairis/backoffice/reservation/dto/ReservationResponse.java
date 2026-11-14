package es.viajesaltairis.backoffice.reservation.dto;

import es.viajesaltairis.backoffice.reservation.ReservationStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        UUID hotelId,
        String hotelName,
        UUID roomTypeId,
        String roomTypeName,
        String holderName,
        String holderEmail,
        String holderPhone,
        LocalDate checkIn,
        LocalDate checkOut,
        long nights,
        int roomsCount,
        ReservationStatus status,
        BigDecimal totalPrice,
        Instant createdAt
) {
}
