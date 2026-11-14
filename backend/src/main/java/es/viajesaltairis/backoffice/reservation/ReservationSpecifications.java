package es.viajesaltairis.backoffice.reservation;

import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/** Filtros combinables del listado de reservas. Un filtro vacío no restringe nada. */
final class ReservationSpecifications {

    private ReservationSpecifications() {
    }

    /** Nombre o email del titular (coincidencia parcial). */
    static Specification<Reservation> holderContains(String text) {
        if (!StringUtils.hasText(text)) {
            return Specification.unrestricted();
        }
        String pattern = "%" + text.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("holderName")), pattern),
                cb.like(cb.lower(root.get("holderEmail")), pattern));
    }

    static Specification<Reservation> hasStatus(ReservationStatus status) {
        if (status == null) {
            return Specification.unrestricted();
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    static Specification<Reservation> forHotel(UUID hotelId) {
        if (hotelId == null) {
            return Specification.unrestricted();
        }
        return (root, query, cb) -> cb.equal(root.get("roomType").get("hotel").get("id"), hotelId);
    }

    /** Estancias que se solapan con [from, to] (ambos incluidos). */
    static Specification<Reservation> staysOverlapping(LocalDate from, LocalDate to) {
        Specification<Reservation> spec = Specification.unrestricted();
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThan(root.get("checkOut"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("checkIn"), to));
        }
        return spec;
    }
}
