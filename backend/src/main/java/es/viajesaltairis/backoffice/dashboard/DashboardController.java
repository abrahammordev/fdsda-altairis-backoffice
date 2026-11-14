package es.viajesaltairis.backoffice.dashboard;

import es.viajesaltairis.backoffice.dashboard.dto.DashboardSummaryResponse;
import es.viajesaltairis.backoffice.dashboard.dto.OccupancyPoint;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "KPIs de la operativa de un día (por defecto, hoy)")
    public DashboardSummaryResponse summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return dashboardService.summary(date != null ? date : dashboardService.today());
    }

    @GetMapping("/occupancy")
    @Operation(summary = "Serie diaria de ocupación y llegadas (por defecto, -7 / +30 días)")
    public List<OccupancyPoint> occupancy(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate today = dashboardService.today();
        return dashboardService.occupancy(from != null ? from : today.minusDays(7),
                to != null ? to : today.plusDays(30));
    }
}
