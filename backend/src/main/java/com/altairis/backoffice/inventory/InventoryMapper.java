package com.altairis.backoffice.inventory;

import com.altairis.backoffice.inventory.dto.InventoryDayResponse;

final class InventoryMapper {

    private InventoryMapper() {
    }

    static InventoryDayResponse toDay(Inventory i) {
        return new InventoryDayResponse(i.getDate(), i.getTotalRooms(), i.getAvailableRooms(), i.getBookedRooms(),
                i.getPrice(), occupancyPct(i.getBookedRooms(), i.getTotalRooms()));
    }

    /** Porcentaje con un decimal; 0 si no hay habitaciones. */
    static double occupancyPct(long booked, long total) {
        return total == 0 ? 0.0 : Math.round(booked * 1000.0 / total) / 10.0;
    }
}
