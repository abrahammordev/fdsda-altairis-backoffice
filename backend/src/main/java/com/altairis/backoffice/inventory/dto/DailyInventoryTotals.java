package com.altairis.backoffice.inventory.dto;

import java.time.LocalDate;

/** Agregado diario de inventario: habitaciones ofertadas y reservadas. */
public record DailyInventoryTotals(LocalDate date, long totalRooms, long bookedRooms) {
}
