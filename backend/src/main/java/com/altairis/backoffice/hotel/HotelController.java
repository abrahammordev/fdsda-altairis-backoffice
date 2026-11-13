package com.altairis.backoffice.hotel;

import com.altairis.backoffice.common.dto.PageResponse;
import com.altairis.backoffice.hotel.dto.CreateHotelRequest;
import com.altairis.backoffice.hotel.dto.HotelResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotels")
@Tag(name = "Hoteles")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    @Operation(summary = "Listado paginado con búsqueda por nombre/ciudad y filtros")
    public PageResponse<HotelResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Short stars,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return hotelService.search(search, country, stars, pageable);
    }

    @GetMapping("/{id}")
    public HotelResponse findById(@PathVariable UUID id) {
        return hotelService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Alta de hotel")
    public ResponseEntity<HotelResponse> create(@Valid @RequestBody CreateHotelRequest request) {
        HotelResponse created = hotelService.create(request);
        return ResponseEntity.created(URI.create("/api/hotels/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public HotelResponse update(@PathVariable UUID id, @Valid @RequestBody CreateHotelRequest request) {
        return hotelService.update(id, request);
    }
}
