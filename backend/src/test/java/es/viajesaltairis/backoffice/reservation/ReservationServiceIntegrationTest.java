package es.viajesaltairis.backoffice.reservation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import es.viajesaltairis.backoffice.TestcontainersConfiguration;
import es.viajesaltairis.backoffice.common.exception.BusinessException;
import es.viajesaltairis.backoffice.hotel.HotelService;
import es.viajesaltairis.backoffice.hotel.dto.CreateHotelRequest;
import es.viajesaltairis.backoffice.inventory.InventoryService;
import es.viajesaltairis.backoffice.inventory.dto.InventoryDayResponse;
import es.viajesaltairis.backoffice.inventory.dto.UpsertInventoryRequest;
import es.viajesaltairis.backoffice.reservation.dto.CreateReservationRequest;
import es.viajesaltairis.backoffice.reservation.dto.ReservationResponse;
import es.viajesaltairis.backoffice.reservation.dto.UpdateReservationRequest;
import es.viajesaltairis.backoffice.roomtype.RoomTypeService;
import es.viajesaltairis.backoffice.roomtype.dto.CreateRoomTypeRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/** Flujo completo contra PostgreSQL real (Testcontainers): disponibilidad, reserva y cancelación. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class ReservationServiceIntegrationTest {

    private static final LocalDate DAY1 = LocalDate.of(2030, 5, 1);

    @Autowired HotelService hotelService;
    @Autowired RoomTypeService roomTypeService;
    @Autowired InventoryService inventoryService;
    @Autowired ReservationService reservationService;

    private UUID roomTypeId;

    @BeforeEach
    void setUp() {
        UUID hotelId = hotelService.create(new CreateHotelRequest("Hotel IT " + UUID.randomUUID(), "Calle 1",
                "Madrid", "España", (short) 4, null)).id();
        roomTypeId = roomTypeService.create(hotelId,
                new CreateRoomTypeRequest("Doble", null, (short) 2, new BigDecimal("100.00"))).id();
        // 2 habitaciones del 1 al 3 de mayo; el sábado 3 a 150 €
        inventoryService.upsert(roomTypeId, new UpsertInventoryRequest(DAY1, DAY1.plusDays(1), 2, null));
        inventoryService.upsert(roomTypeId,
                new UpsertInventoryRequest(DAY1.plusDays(2), DAY1.plusDays(2), 2, new BigDecimal("150.00")));
    }

    @Test
    void createReservation_discountsInventoryAndSumsNightlyPrices() {
        ReservationResponse r = reservationService.create(request(DAY1, DAY1.plusDays(3), 2));

        assertThat(r.status()).isEqualTo(ReservationStatus.CONFIRMED);
        assertThat(r.nights()).isEqualTo(3);
        assertThat(r.totalPrice()).isEqualByComparingTo("700.00"); // (100 + 100 + 150) x 2
        assertThat(available()).containsExactly(0, 0, 0);
    }

    @Test
    void createReservation_withoutAvailability_failsAndChangesNothing() {
        reservationService.create(request(DAY1.plusDays(1), DAY1.plusDays(2), 2)); // agota el día 2

        assertThatThrownBy(() -> reservationService.create(request(DAY1, DAY1.plusDays(3), 1)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Sin disponibilidad");
        assertThat(available()).containsExactly(2, 0, 2); // rollback: el día 1 no quedó descontado
    }

    @Test
    void createReservation_withoutInventoryLoaded_fails() {
        assertThatThrownBy(() -> reservationService.create(request(DAY1.plusDays(2), DAY1.plusDays(5), 1)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("No hay inventario");
    }

    @Test
    void cancelReservation_releasesInventory_andCannotBeReactivated() {
        UUID id = reservationService.create(request(DAY1, DAY1.plusDays(2), 1)).id();

        reservationService.changeStatus(id, ReservationStatus.CANCELLED);

        assertThat(available()).containsExactly(2, 2, 2);
        assertThatThrownBy(() -> reservationService.changeStatus(id, ReservationStatus.CONFIRMED))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void updateReservation_movesInventoryAndRecalculatesPrice() {
        UUID id = reservationService.create(request(DAY1, DAY1.plusDays(2), 2)).id(); // días 1-2, 2 hab.

        ReservationResponse r = reservationService.update(id, update(DAY1.plusDays(1), DAY1.plusDays(3), 1));

        assertThat(r.checkIn()).isEqualTo(DAY1.plusDays(1));
        assertThat(r.totalPrice()).isEqualByComparingTo("250.00"); // 100 + 150
        assertThat(r.holderName()).isEqualTo("Titular Editado");
        assertThat(available()).containsExactly(2, 1, 1);
    }

    @Test
    void updateReservation_withoutAvailability_failsAndKeepsOriginal() {
        UUID id = reservationService.create(request(DAY1, DAY1.plusDays(1), 1)).id();
        reservationService.create(request(DAY1.plusDays(2), DAY1.plusDays(3), 2)); // agota el día 3

        assertThatThrownBy(() -> reservationService.update(id, update(DAY1, DAY1.plusDays(3), 1)))
                .isInstanceOf(BusinessException.class);

        ReservationResponse unchanged = reservationService.findById(id);
        assertThat(unchanged.checkOut()).isEqualTo(DAY1.plusDays(1));
        assertThat(unchanged.holderName()).isEqualTo("Titular Test");
        assertThat(available()).containsExactly(1, 2, 0);
    }

    @Test
    void updateReservation_cancelled_isRejected() {
        UUID id = reservationService.create(request(DAY1, DAY1.plusDays(1), 1)).id();
        reservationService.changeStatus(id, ReservationStatus.CANCELLED);

        assertThatThrownBy(() -> reservationService.update(id, update(DAY1, DAY1.plusDays(1), 1)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cancelada");
    }

    private UpdateReservationRequest update(LocalDate in, LocalDate out, int rooms) {
        return new UpdateReservationRequest("Titular Editado", "test@test.com", null, in, out, rooms);
    }

    private CreateReservationRequest request(LocalDate in, LocalDate out, int rooms) {
        return new CreateReservationRequest(roomTypeId, "Titular Test", "test@test.com", null, in, out, rooms, null);
    }

    private java.util.List<Integer> available() {
        return inventoryService.findByRoomType(roomTypeId, DAY1, DAY1.plusDays(2)).stream()
                .map(InventoryDayResponse::availableRooms)
                .toList();
    }
}
