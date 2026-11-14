package es.viajesaltairis.backoffice.dashboard;

import es.viajesaltairis.backoffice.dashboard.dto.DashboardSummaryResponse;
import es.viajesaltairis.backoffice.dashboard.dto.OccupancyPoint;
import es.viajesaltairis.backoffice.hotel.HotelRepository;
import es.viajesaltairis.backoffice.inventory.InventoryService;
import es.viajesaltairis.backoffice.inventory.dto.DailyInventoryTotals;
import es.viajesaltairis.backoffice.reservation.ReservationRepository;
import es.viajesaltairis.backoffice.reservation.ReservationStatus;
import es.viajesaltairis.backoffice.reservation.dto.StatusCount;
import es.viajesaltairis.backoffice.roomtype.RoomTypeRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Agrega datos de hoteles, inventario y reservas para el panel operativo. Solo lectura. */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");

    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final ReservationRepository reservationRepository;
    private final InventoryService inventoryService;
    private final Clock clock;

    public DashboardService(HotelRepository hotelRepository, RoomTypeRepository roomTypeRepository,
                            ReservationRepository reservationRepository, InventoryService inventoryService) {
        this.hotelRepository = hotelRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.reservationRepository = reservationRepository;
        this.inventoryService = inventoryService;
        this.clock = Clock.system(ZONE);
    }

    public LocalDate today() {
        return LocalDate.now(clock);
    }

    public DashboardSummaryResponse summary(LocalDate date) {
        Instant dayStart = date.atStartOfDay(ZONE).toInstant();
        Instant dayEnd = date.plusDays(1).atStartOfDay(ZONE).toInstant();

        DailyInventoryTotals inv = inventoryService.dailyTotals(date, date).stream()
                .findFirst()
                .orElse(new DailyInventoryTotals(date, 0, 0));

        Map<ReservationStatus, Long> byStatus = new EnumMap<>(ReservationStatus.class);
        for (ReservationStatus s : ReservationStatus.values()) {
            byStatus.put(s, 0L);
        }
        for (StatusCount sc : reservationRepository.countByStatus()) {
            byStatus.put(sc.status(), sc.count());
        }

        return new DashboardSummaryResponse(
                date,
                hotelRepository.count(),
                roomTypeRepository.count(),
                reservationRepository.countArrivals(date),
                reservationRepository.countDepartures(date),
                reservationRepository.countInHouse(date),
                reservationRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(dayStart, dayEnd),
                inv.totalRooms() - inv.bookedRooms(),
                inv.bookedRooms(),
                pct(inv.bookedRooms(), inv.totalRooms()),
                reservationRepository.revenueSince(Instant.now(clock).minus(Duration.ofDays(30))),
                byStatus);
    }

    /** Serie diaria de ocupación y llegadas; incluye los días sin datos con valores a 0. */
    public List<OccupancyPoint> occupancy(LocalDate from, LocalDate to) {
        Map<LocalDate, DailyInventoryTotals> totals = new HashMap<>();
        inventoryService.dailyTotals(from, to).forEach(t -> totals.put(t.date(), t));

        Map<LocalDate, Long> arrivals = new HashMap<>();
        for (Object[] row : reservationRepository.arrivalsPerDay(from, to)) {
            arrivals.put((LocalDate) row[0], ((Number) row[1]).longValue());
        }

        List<OccupancyPoint> series = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            DailyInventoryTotals t = totals.getOrDefault(d, new DailyInventoryTotals(d, 0, 0));
            series.add(new OccupancyPoint(d, t.totalRooms(), t.bookedRooms(),
                    pct(t.bookedRooms(), t.totalRooms()), arrivals.getOrDefault(d, 0L)));
        }
        return series;
    }

    private static double pct(long part, long total) {
        return total == 0 ? 0.0 : Math.round(part * 1000.0 / total) / 10.0;
    }
}
