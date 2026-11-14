package es.viajesaltairis.backoffice.inventory;

import es.viajesaltairis.backoffice.common.exception.BusinessException;
import es.viajesaltairis.backoffice.roomtype.RoomType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Disponibilidad de un tipo de habitación en una fecha concreta.
 * Invariante: 0 <= availableRooms <= totalRooms. Solo se modifica a través de sus métodos.
 */
@Entity
@Table(name = "inventory")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inventory {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_type_id", nullable = false, updatable = false)
    private RoomType roomType;

    @Column(nullable = false, updatable = false)
    private LocalDate date;

    @Column(name = "total_rooms", nullable = false)
    private int totalRooms;

    @Column(name = "available_rooms", nullable = false)
    private int availableRooms;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public Inventory(RoomType roomType, LocalDate date, int totalRooms, BigDecimal price) {
        this.id = UUID.randomUUID();
        this.roomType = roomType;
        this.date = date;
        this.totalRooms = totalRooms;
        this.availableRooms = totalRooms;
        this.price = price;
    }

    public int getBookedRooms() {
        return totalRooms - availableRooms;
    }

    /** Cambia el cupo total y el precio conservando las habitaciones ya reservadas. */
    public void updateCapacity(int newTotalRooms, BigDecimal newPrice) {
        int booked = getBookedRooms();
        if (newTotalRooms < booked) {
            throw new BusinessException("El " + date + " ya hay " + booked
                    + " habitaciones reservadas; el total no puede ser " + newTotalRooms);
        }
        this.totalRooms = newTotalRooms;
        this.availableRooms = newTotalRooms - booked;
        this.price = newPrice;
    }

    public void reserve(int rooms) {
        if (rooms > availableRooms) {
            throw new BusinessException("Sin disponibilidad el " + date + ": quedan " + availableRooms
                    + " y se solicitan " + rooms);
        }
        this.availableRooms -= rooms;
    }

    public void release(int rooms) {
        this.availableRooms = Math.min(totalRooms, availableRooms + rooms);
    }
}
