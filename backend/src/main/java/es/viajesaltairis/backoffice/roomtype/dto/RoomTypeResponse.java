package es.viajesaltairis.backoffice.roomtype.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RoomTypeResponse(
        UUID id,
        UUID hotelId,
        String hotelName,
        String name,
        String description,
        short capacity,
        BigDecimal basePrice
) {
}
