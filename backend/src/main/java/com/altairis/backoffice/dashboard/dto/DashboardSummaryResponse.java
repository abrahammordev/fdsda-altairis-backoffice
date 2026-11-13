package com.altairis.backoffice.dashboard.dto;

import com.altairis.backoffice.reservation.ReservationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/** Foto de la operativa de un día: KPIs para las tarjetas del panel principal. */
public record DashboardSummaryResponse(
        LocalDate date,
        long totalHotels,
        long totalRoomTypes,
        long arrivals,
        long departures,
        long inHouse,
        long reservationsCreatedToday,
        long roomsAvailable,
        long roomsBooked,
        double occupancyPct,
        BigDecimal revenueLast30Days,
        Map<ReservationStatus, Long> reservationsByStatus
) {
}
