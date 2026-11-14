package es.viajesaltairis.backoffice.inventory.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Vista calendario de un hotel: una fila por tipo de habitación y una celda por día.
 * Los días sin inventario cargado no aparecen en {@code days}.
 */
public record HotelInventoryResponse(
        UUID hotelId,
        String hotelName,
        LocalDate from,
        LocalDate to,
        List<RoomTypeRow> roomTypes
) {
    public record RoomTypeRow(UUID roomTypeId, String name, List<InventoryDayResponse> days) {
    }
}
