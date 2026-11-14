package es.viajesaltairis.backoffice.inventory;

import es.viajesaltairis.backoffice.common.exception.BusinessException;
import es.viajesaltairis.backoffice.hotel.Hotel;
import es.viajesaltairis.backoffice.hotel.HotelService;
import es.viajesaltairis.backoffice.inventory.dto.DailyInventoryTotals;
import es.viajesaltairis.backoffice.inventory.dto.HotelInventoryResponse;
import es.viajesaltairis.backoffice.inventory.dto.InventoryDayResponse;
import es.viajesaltairis.backoffice.inventory.dto.UpsertInventoryRequest;
import es.viajesaltairis.backoffice.roomtype.RoomType;
import es.viajesaltairis.backoffice.roomtype.RoomTypeRepository;
import es.viajesaltairis.backoffice.roomtype.RoomTypeService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InventoryService {

    static final int MAX_QUERY_DAYS = 366;

    private final InventoryRepository inventoryRepository;
    private final RoomTypeService roomTypeService;
    private final RoomTypeRepository roomTypeRepository;
    private final HotelService hotelService;

    public InventoryService(InventoryRepository inventoryRepository, RoomTypeService roomTypeService,
                            RoomTypeRepository roomTypeRepository, HotelService hotelService) {
        this.inventoryRepository = inventoryRepository;
        this.roomTypeService = roomTypeService;
        this.roomTypeRepository = roomTypeRepository;
        this.hotelService = hotelService;
    }

    /** Crea los días que falten y actualiza los existentes en el rango indicado. */
    @Transactional
    public List<InventoryDayResponse> upsert(UUID roomTypeId, UpsertInventoryRequest request) {
        RoomType roomType = roomTypeService.getEntity(roomTypeId);
        BigDecimal price = request.price() != null ? request.price() : roomType.getBasePrice();

        Map<LocalDate, Inventory> existing = inventoryRepository
                .findByRoomTypeIdAndDateBetweenOrderByDateAsc(roomTypeId, request.from(), request.to())
                .stream()
                .collect(Collectors.toMap(Inventory::getDate, Function.identity()));

        List<Inventory> result = new ArrayList<>();
        for (LocalDate d = request.from(); !d.isAfter(request.to()); d = d.plusDays(1)) {
            Inventory day = existing.get(d);
            if (day == null) {
                day = new Inventory(roomType, d, request.totalRooms(), price);
            } else {
                day.updateCapacity(request.totalRooms(), price);
            }
            result.add(day);
        }
        return inventoryRepository.saveAll(result).stream().map(InventoryMapper::toDay).toList();
    }

    public List<InventoryDayResponse> findByRoomType(UUID roomTypeId, LocalDate from, LocalDate to) {
        validateRange(from, to);
        roomTypeService.getEntity(roomTypeId);
        return inventoryRepository.findByRoomTypeIdAndDateBetweenOrderByDateAsc(roomTypeId, from, to).stream()
                .map(InventoryMapper::toDay)
                .toList();
    }

    /** Calendario del hotel: todos sus tipos de habitación en el rango. */
    public HotelInventoryResponse findByHotel(UUID hotelId, LocalDate from, LocalDate to) {
        validateRange(from, to);
        Hotel hotel = hotelService.getEntity(hotelId);
        List<RoomType> roomTypes = roomTypeRepository.findByHotelIdOrderByBasePriceAsc(hotelId);

        Map<UUID, List<InventoryDayResponse>> daysByRoomType = roomTypes.isEmpty()
                ? Map.of()
                : inventoryRepository.findByRoomTypeIdInAndDateBetweenOrderByDateAsc(
                                roomTypes.stream().map(RoomType::getId).toList(), from, to)
                        .stream()
                        .collect(Collectors.groupingBy(i -> i.getRoomType().getId(),
                                Collectors.mapping(InventoryMapper::toDay, Collectors.toList())));

        List<HotelInventoryResponse.RoomTypeRow> rows = roomTypes.stream()
                .map(rt -> new HotelInventoryResponse.RoomTypeRow(rt.getId(), rt.getName(),
                        daysByRoomType.getOrDefault(rt.getId(), List.of())))
                .toList();
        return new HotelInventoryResponse(hotel.getId(), hotel.getName(), from, to, rows);
    }

    /** Totales diarios globales, usados por el dashboard. */
    public List<DailyInventoryTotals> dailyTotals(LocalDate from, LocalDate to) {
        validateRange(from, to);
        return inventoryRepository.dailyTotals(from, to);
    }

    /**
     * Bloquea y descuenta las noches [checkIn, checkOut). Devuelve el precio de una habitación
     * para toda la estancia. Lanza {@link BusinessException} si falta inventario o cupo.
     */
    @Transactional
    public BigDecimal reserve(UUID roomTypeId, LocalDate checkIn, LocalDate checkOut, int rooms) {
        List<Inventory> nights = lockNights(roomTypeId, checkIn, checkOut);
        nights.forEach(n -> n.reserve(rooms));
        return nights.stream().map(Inventory::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Devuelve al inventario las habitaciones de una estancia (p. ej. al cancelar). */
    @Transactional
    public void release(UUID roomTypeId, LocalDate checkIn, LocalDate checkOut, int rooms) {
        inventoryRepository.lockStayNights(roomTypeId, checkIn, checkOut).forEach(n -> n.release(rooms));
    }

    private List<Inventory> lockNights(UUID roomTypeId, LocalDate checkIn, LocalDate checkOut) {
        List<Inventory> nights = inventoryRepository.lockStayNights(roomTypeId, checkIn, checkOut);
        long expected = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights.size() != expected) {
            throw new BusinessException("No hay inventario cargado para todas las noches entre "
                    + checkIn + " y " + checkOut);
        }
        return nights;
    }

    private static void validateRange(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("'to' debe ser igual o posterior a 'from'");
        }
        if (ChronoUnit.DAYS.between(from, to) >= MAX_QUERY_DAYS) {
            throw new IllegalArgumentException("El rango no puede superar " + MAX_QUERY_DAYS + " días");
        }
    }
}
