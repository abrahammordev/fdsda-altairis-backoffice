package es.viajesaltairis.backoffice.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Estado de un día para un tipo de habitación. occupancyPct = reservadas / total * 100. */
public record InventoryDayResponse(
        LocalDate date,
        int totalRooms,
        int availableRooms,
        int bookedRooms,
        BigDecimal price,
        double occupancyPct
) {
}
