package es.viajesaltairis.backoffice.hotel.dto;

import java.time.Instant;
import java.util.UUID;

public record HotelResponse(
        UUID id,
        String name,
        String address,
        String city,
        String country,
        short stars,
        String description,
        Instant createdAt
) {
}
