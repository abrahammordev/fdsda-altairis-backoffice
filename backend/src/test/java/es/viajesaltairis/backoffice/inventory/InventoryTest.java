package es.viajesaltairis.backoffice.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import es.viajesaltairis.backoffice.common.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

/** Reglas de la entidad Inventory, sin Spring ni base de datos. */
class InventoryTest {

    private final Inventory day = new Inventory(null, LocalDate.of(2030, 1, 1), 5, BigDecimal.TEN);

    @Test
    void reserveAndRelease_keepInvariant() {
        day.reserve(3);
        assertThat(day.getAvailableRooms()).isEqualTo(2);
        assertThat(day.getBookedRooms()).isEqualTo(3);

        day.release(10);
        assertThat(day.getAvailableRooms()).isEqualTo(5); // nunca supera el total
    }

    @Test
    void reserve_moreThanAvailable_throws() {
        assertThatThrownBy(() -> day.reserve(6)).isInstanceOf(BusinessException.class);
        assertThat(day.getAvailableRooms()).isEqualTo(5);
    }

    @Test
    void updateCapacity_keepsBookedRooms() {
        day.reserve(2);
        day.updateCapacity(8, BigDecimal.ONE);
        assertThat(day.getAvailableRooms()).isEqualTo(6);

        assertThatThrownBy(() -> day.updateCapacity(1, BigDecimal.ONE)).isInstanceOf(BusinessException.class);
    }
}
