package com.altairis.backoffice.inventory;

import com.altairis.backoffice.inventory.dto.DailyInventoryTotals;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    List<Inventory> findByRoomTypeIdAndDateBetweenOrderByDateAsc(UUID roomTypeId, LocalDate from, LocalDate to);

    List<Inventory> findByRoomTypeIdInAndDateBetweenOrderByDateAsc(Collection<UUID> roomTypeIds,
                                                                   LocalDate from, LocalDate to);

    /**
     * Noches de una estancia [checkIn, checkOut) bloqueadas para escritura, para que dos reservas
     * simultáneas no puedan consumir la misma habitación.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i FROM Inventory i
            WHERE i.roomType.id = :roomTypeId AND i.date >= :checkIn AND i.date < :checkOut
            ORDER BY i.date
            """)
    List<Inventory> lockStayNights(@Param("roomTypeId") UUID roomTypeId,
                                   @Param("checkIn") LocalDate checkIn,
                                   @Param("checkOut") LocalDate checkOut);

    /** Totales diarios de todo el inventario (para la gráfica de ocupación). */
    @Query("""
            SELECT new com.altairis.backoffice.inventory.dto.DailyInventoryTotals(
                       i.date, SUM(i.totalRooms), SUM(i.totalRooms - i.availableRooms))
            FROM Inventory i
            WHERE i.date BETWEEN :from AND :to
            GROUP BY i.date
            ORDER BY i.date
            """)
    List<DailyInventoryTotals> dailyTotals(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
