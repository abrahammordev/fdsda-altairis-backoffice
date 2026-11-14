package es.viajesaltairis.backoffice.hotel;

import es.viajesaltairis.backoffice.hotel.dto.CreateHotelRequest;
import es.viajesaltairis.backoffice.hotel.dto.HotelResponse;

/** Conversión entre la entidad {@link Hotel} y sus DTOs. */
final class HotelMapper {

    private HotelMapper() {
    }

    static Hotel toEntity(CreateHotelRequest req) {
        return new Hotel(req.name().trim(), req.address().trim(), req.city().trim(), req.country().trim(),
                req.stars(), req.description());
    }

    static void update(Hotel hotel, CreateHotelRequest req) {
        hotel.setName(req.name().trim());
        hotel.setAddress(req.address().trim());
        hotel.setCity(req.city().trim());
        hotel.setCountry(req.country().trim());
        hotel.setStars(req.stars());
        hotel.setDescription(req.description());
    }

    static HotelResponse toResponse(Hotel h) {
        return new HotelResponse(h.getId(), h.getName(), h.getAddress(), h.getCity(), h.getCountry(),
                h.getStars(), h.getDescription(), h.getCreatedAt());
    }
}
