package es.viajesaltairis.backoffice.dashboard.dto;

import java.time.LocalDate;

/** Punto diario para la gráfica de ocupación del panel. */
public record OccupancyPoint(
        LocalDate date,
        long totalRooms,
        long bookedRooms,
        double occupancyPct,
        long arrivals
) {
}
