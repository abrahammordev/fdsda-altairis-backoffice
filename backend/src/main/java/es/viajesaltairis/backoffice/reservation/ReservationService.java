package es.viajesaltairis.backoffice.reservation;

import es.viajesaltairis.backoffice.common.dto.PageResponse;
import es.viajesaltairis.backoffice.common.exception.NotFoundException;
import es.viajesaltairis.backoffice.inventory.InventoryService;
import es.viajesaltairis.backoffice.reservation.dto.CreateReservationRequest;
import es.viajesaltairis.backoffice.reservation.dto.ReservationResponse;
import es.viajesaltairis.backoffice.reservation.dto.UpdateReservationRequest;
import es.viajesaltairis.backoffice.roomtype.RoomType;
import es.viajesaltairis.backoffice.roomtype.RoomTypeService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomTypeService roomTypeService;
    private final InventoryService inventoryService;

    public ReservationService(ReservationRepository reservationRepository, RoomTypeService roomTypeService,
                              InventoryService inventoryService) {
        this.reservationRepository = reservationRepository;
        this.roomTypeService = roomTypeService;
        this.inventoryService = inventoryService;
    }

    public PageResponse<ReservationResponse> search(String search, ReservationStatus status, UUID hotelId,
                                                    LocalDate from, LocalDate to, Pageable pageable) {
        Specification<Reservation> spec = ReservationSpecifications.holderContains(search)
                .and(ReservationSpecifications.hasStatus(status))
                .and(ReservationSpecifications.forHotel(hotelId))
                .and(ReservationSpecifications.staysOverlapping(from, to));
        return PageResponse.from(reservationRepository.findAll(spec, pageable), ReservationMapper::toResponse);
    }

    public ReservationResponse findById(UUID id) {
        return ReservationMapper.toResponse(getEntity(id));
    }

    /**
     * Comprueba disponibilidad noche a noche (con bloqueo), descuenta inventario y guarda la reserva.
     * Si alguna noche no tiene cupo, se lanza 409 y no se modifica nada (rollback).
     */
    @Transactional
    public ReservationResponse create(CreateReservationRequest request) {
        RoomType roomType = roomTypeService.getEntity(request.roomTypeId());
        int rooms = request.roomsCount();

        BigDecimal pricePerRoom = inventoryService.reserve(roomType.getId(), request.checkIn(),
                request.checkOut(), rooms);

        ReservationStatus status = request.status() != null ? request.status() : ReservationStatus.CONFIRMED;
        Reservation reservation = new Reservation(roomType, request.holderName().trim(),
                request.holderEmail().trim().toLowerCase(), request.holderPhone(), request.checkIn(),
                request.checkOut(), rooms, status, pricePerRoom.multiply(BigDecimal.valueOf(rooms)));
        return ReservationMapper.toResponse(reservationRepository.save(reservation));
    }

    /**
     * Edita titular y estancia. Si cambian fechas o habitaciones, devuelve la estancia anterior al inventario
     * y reserva la nueva con el precio de sus noches. Si la nueva no cabe, 409 y rollback: la reserva queda igual.
     */
    @Transactional
    public ReservationResponse update(UUID id, UpdateReservationRequest request) {
        Reservation reservation = getEntity(id);
        reservation.updateHolder(request.holderName().trim(), request.holderEmail().trim().toLowerCase(),
                request.holderPhone());

        int rooms = request.roomsCount();
        if (!reservation.hasSameStay(request.checkIn(), request.checkOut(), rooms)) {
            UUID roomTypeId = reservation.getRoomType().getId();
            inventoryService.release(roomTypeId, reservation.getCheckIn(), reservation.getCheckOut(),
                    reservation.getRoomsCount());
            BigDecimal pricePerRoom = inventoryService.reserve(roomTypeId, request.checkIn(), request.checkOut(),
                    rooms);
            reservation.changeStay(request.checkIn(), request.checkOut(), rooms,
                    pricePerRoom.multiply(BigDecimal.valueOf(rooms)));
        }
        return ReservationMapper.toResponse(reservation);
    }

    /** Cambia el estado; al cancelar devuelve las habitaciones al inventario. */
    @Transactional
    public ReservationResponse changeStatus(UUID id, ReservationStatus target) {
        Reservation reservation = getEntity(id);
        boolean releases = reservation.getStatus().holdsInventory() && !target.holdsInventory();
        reservation.changeStatus(target);
        if (releases) {
            inventoryService.release(reservation.getRoomType().getId(), reservation.getCheckIn(),
                    reservation.getCheckOut(), reservation.getRoomsCount());
        }
        return ReservationMapper.toResponse(reservation);
    }

    private Reservation getEntity(UUID id) {
        return reservationRepository.findWithDetailsById(id)
                .orElseThrow(() -> NotFoundException.of("Reserva", id));
    }
}
