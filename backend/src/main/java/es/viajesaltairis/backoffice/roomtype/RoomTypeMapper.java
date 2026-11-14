package es.viajesaltairis.backoffice.roomtype;

import es.viajesaltairis.backoffice.roomtype.dto.RoomTypeResponse;

final class RoomTypeMapper {

    private RoomTypeMapper() {
    }

    static RoomTypeResponse toResponse(RoomType rt) {
        return new RoomTypeResponse(rt.getId(), rt.getHotel().getId(), rt.getHotel().getName(), rt.getName(),
                rt.getDescription(), rt.getCapacity(), rt.getBasePrice());
    }
}
