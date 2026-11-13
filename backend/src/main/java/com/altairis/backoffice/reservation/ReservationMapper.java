package com.altairis.backoffice.reservation;

import com.altairis.backoffice.reservation.dto.ReservationResponse;

final class ReservationMapper {

    private ReservationMapper() {
    }

    static ReservationResponse toResponse(Reservation r) {
        var roomType = r.getRoomType();
        var hotel = roomType.getHotel();
        return new ReservationResponse(r.getId(), hotel.getId(), hotel.getName(), roomType.getId(),
                roomType.getName(), r.getGuestName(), r.getGuestEmail(), r.getGuestPhone(), r.getCheckIn(),
                r.getCheckOut(), r.getNights(), r.getRoomsCount(), r.getStatus(), r.getTotalPrice(),
                r.getCreatedAt());
    }
}
