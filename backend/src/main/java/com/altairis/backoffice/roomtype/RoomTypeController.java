package com.altairis.backoffice.roomtype;

import com.altairis.backoffice.roomtype.dto.CreateRoomTypeRequest;
import com.altairis.backoffice.roomtype.dto.RoomTypeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Tipos de habitación")
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    public RoomTypeController(RoomTypeService roomTypeService) {
        this.roomTypeService = roomTypeService;
    }

    @GetMapping("/hotels/{hotelId}/room-types")
    @Operation(summary = "Tipos de habitación de un hotel")
    public List<RoomTypeResponse> findByHotel(@PathVariable UUID hotelId) {
        return roomTypeService.findByHotel(hotelId);
    }

    @PostMapping("/hotels/{hotelId}/room-types")
    @Operation(summary = "Asociar un nuevo tipo de habitación a un hotel")
    public ResponseEntity<RoomTypeResponse> create(@PathVariable UUID hotelId,
                                                   @Valid @RequestBody CreateRoomTypeRequest request) {
        RoomTypeResponse created = roomTypeService.create(hotelId, request);
        return ResponseEntity.created(URI.create("/api/room-types/" + created.id())).body(created);
    }

    @GetMapping("/room-types/{id}")
    public RoomTypeResponse findById(@PathVariable UUID id) {
        return roomTypeService.findById(id);
    }

    @PutMapping("/room-types/{id}")
    public RoomTypeResponse update(@PathVariable UUID id, @Valid @RequestBody CreateRoomTypeRequest request) {
        return roomTypeService.update(id, request);
    }
}
