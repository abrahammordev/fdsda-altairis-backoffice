package es.viajesaltairis.backoffice.reservation;

import es.viajesaltairis.backoffice.common.exception.BusinessException;
import es.viajesaltairis.backoffice.roomtype.RoomType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Reserva de N habitaciones de un tipo para la estancia [checkIn, checkOut). */
@Entity
@Table(name = "reservation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_type_id", nullable = false, updatable = false)
    private RoomType roomType;

    @Column(name = "holder_name", nullable = false, length = 150)
    private String holderName;

    @Column(name = "holder_email", nullable = false, length = 150)
    private String holderEmail;

    @Column(name = "holder_phone", length = 30)
    private String holderPhone;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(name = "rooms_count", nullable = false)
    private int roomsCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Reservation(RoomType roomType, String holderName, String holderEmail, String holderPhone,
                       LocalDate checkIn, LocalDate checkOut, int roomsCount, ReservationStatus status,
                       BigDecimal totalPrice) {
        this.id = UUID.randomUUID();
        this.roomType = roomType;
        this.holderName = holderName;
        this.holderEmail = holderEmail;
        this.holderPhone = holderPhone;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.roomsCount = roomsCount;
        this.status = status;
        this.totalPrice = totalPrice;
    }

    public long getNights() {
        return ChronoUnit.DAYS.between(checkIn, checkOut);
    }

    public void changeStatus(ReservationStatus target) {
        if (!status.canTransitionTo(target)) {
            throw new BusinessException("No se puede pasar una reserva de " + status + " a " + target);
        }
        this.status = target;
    }

    public void updateHolder(String name, String email, String phone) {
        ensureActive();
        this.holderName = name;
        this.holderEmail = email;
        this.holderPhone = phone;
    }

    /** Nueva estancia y precio. El service mueve antes el inventario. */
    public void changeStay(LocalDate checkIn, LocalDate checkOut, int roomsCount, BigDecimal totalPrice) {
        ensureActive();
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.roomsCount = roomsCount;
        this.totalPrice = totalPrice;
    }

    public boolean hasSameStay(LocalDate checkIn, LocalDate checkOut, int roomsCount) {
        return this.checkIn.equals(checkIn) && this.checkOut.equals(checkOut) && this.roomsCount == roomsCount;
    }

    private void ensureActive() {
        if (!status.holdsInventory()) {
            throw new BusinessException("No se puede modificar una reserva cancelada");
        }
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
