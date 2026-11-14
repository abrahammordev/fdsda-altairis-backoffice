package es.viajesaltairis.backoffice.inventory;

import es.viajesaltairis.backoffice.inventory.dto.HotelInventoryResponse;
import es.viajesaltairis.backoffice.inventory.dto.InventoryDayResponse;
import es.viajesaltairis.backoffice.inventory.dto.UpsertInventoryRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Inventario")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PutMapping("/room-types/{roomTypeId}/inventory")
    @Operation(summary = "Cargar/actualizar disponibilidad de un tipo de habitación en un rango de fechas")
    public List<InventoryDayResponse> upsert(@PathVariable UUID roomTypeId,
                                             @Valid @RequestBody UpsertInventoryRequest request) {
        return inventoryService.upsert(roomTypeId, request);
    }

    @GetMapping("/room-types/{roomTypeId}/inventory")
    @Operation(summary = "Disponibilidad diaria de un tipo de habitación")
    public List<InventoryDayResponse> findByRoomType(
            @PathVariable UUID roomTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return inventoryService.findByRoomType(roomTypeId, from, to);
    }

    @GetMapping("/hotels/{hotelId}/inventory")
    @Operation(summary = "Vista calendario del inventario de un hotel")
    public HotelInventoryResponse findByHotel(
            @PathVariable UUID hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return inventoryService.findByHotel(hotelId, from, to);
    }
}
