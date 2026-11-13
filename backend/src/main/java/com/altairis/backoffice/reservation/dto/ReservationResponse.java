package com.altairis.backoffice.reservation.dto;

import com.altairis.backoffice.reservation.ReservationStatus;
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
        String guestName,
        String guestEmail,
        String guestPhone,
        LocalDate checkIn,
        LocalDate checkOut,
        long nights,
        int roomsCount,
        ReservationStatus status,
        BigDecimal totalPrice,
        Instant createdAt
) {
}
