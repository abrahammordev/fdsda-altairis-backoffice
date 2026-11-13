package com.altairis.backoffice.reservation;

import com.altairis.backoffice.reservation.dto.StatusCount;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, UUID>,
        JpaSpecificationExecutor<Reservation> {

    /** Listado con tipo de habitación y hotel cargados en la misma consulta (evita N+1). */
    @Override
    @EntityGraph(attributePaths = {"roomType", "roomType.hotel"})
    Page<Reservation> findAll(Specification<Reservation> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"roomType", "roomType.hotel"})
    Optional<Reservation> findWithDetailsById(UUID id);

    // ---- Consultas para el dashboard ----

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.checkIn = :date AND r.status <> com.altairis.backoffice.reservation.ReservationStatus.CANCELLED")
    long countArrivals(@Param("date") LocalDate date);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.checkOut = :date AND r.status <> com.altairis.backoffice.reservation.ReservationStatus.CANCELLED")
    long countDepartures(@Param("date") LocalDate date);

    @Query("""
            SELECT COUNT(r) FROM Reservation r
            WHERE r.checkIn <= :date AND r.checkOut > :date AND r.status <> com.altairis.backoffice.reservation.ReservationStatus.CANCELLED
            """)
    long countInHouse(@Param("date") LocalDate date);

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant from, Instant to);

    @Query("""
            SELECT new com.altairis.backoffice.reservation.dto.StatusCount(r.status, COUNT(r))
            FROM Reservation r GROUP BY r.status
            """)
    List<StatusCount> countByStatus();

    @Query("""
            SELECT COALESCE(SUM(r.totalPrice), 0) FROM Reservation r
            WHERE r.status <> com.altairis.backoffice.reservation.ReservationStatus.CANCELLED AND r.createdAt >= :since
            """)
    BigDecimal revenueSince(@Param("since") Instant since);

    /** Llegadas por día (check-in) en el rango, sin canceladas. Filas: [LocalDate, Long]. */
    @Query("""
            SELECT r.checkIn, COUNT(r) FROM Reservation r
            WHERE r.checkIn BETWEEN :from AND :to AND r.status <> com.altairis.backoffice.reservation.ReservationStatus.CANCELLED
            GROUP BY r.checkIn
            """)
    List<Object[]> arrivalsPerDay(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
