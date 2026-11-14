package es.viajesaltairis.backoffice.hotel;

import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/** Filtros combinables para la búsqueda de hoteles. Un filtro vacío no restringe nada. */
final class HotelSpecifications {

    private HotelSpecifications() {
    }

    /** Coincidencia parcial, sin distinguir mayúsculas, en nombre o ciudad. */
    static Specification<Hotel> textContains(String text) {
        if (!StringUtils.hasText(text)) {
            return Specification.unrestricted();
        }
        String pattern = "%" + text.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("city")), pattern));
    }

    static Specification<Hotel> countryEquals(String country) {
        if (!StringUtils.hasText(country)) {
            return Specification.unrestricted();
        }
        return (root, query, cb) -> cb.equal(root.get("country"), country.trim());
    }

    static Specification<Hotel> starsEquals(Short stars) {
        if (stars == null) {
            return Specification.unrestricted();
        }
        return (root, query, cb) -> cb.equal(root.get("stars"), stars);
    }
}
