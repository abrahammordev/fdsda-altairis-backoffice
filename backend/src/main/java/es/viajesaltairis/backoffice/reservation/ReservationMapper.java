package es.viajesaltairis.backoffice.reservation;

import es.viajesaltairis.backoffice.reservation.dto.ReservationResponse;

final class ReservationMapper {

    private ReservationMapper() {
    }

    static ReservationResponse toResponse(Reservation r) {
        var roomType = r.getRoomType();
        var hotel = roomType.getHotel();
        return new ReservationResponse(r.getId(), hotel.getId(), hotel.getName(), roomType.getId(),
                roomType.getName(), r.getHolderName(), r.getHolderEmail(), r.getHolderPhone(), r.getCheckIn(),
                r.getCheckOut(), r.getNights(), r.getRoomsCount(), r.getStatus(), r.getTotalPrice(),
                r.getCreatedAt());
    }
}
