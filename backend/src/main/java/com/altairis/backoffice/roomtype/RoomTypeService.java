package com.altairis.backoffice.roomtype;

import com.altairis.backoffice.common.exception.BusinessException;
import com.altairis.backoffice.common.exception.NotFoundException;
import com.altairis.backoffice.hotel.Hotel;
import com.altairis.backoffice.hotel.HotelService;
import com.altairis.backoffice.roomtype.dto.CreateRoomTypeRequest;
import com.altairis.backoffice.roomtype.dto.RoomTypeResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final HotelService hotelService;

    public RoomTypeService(RoomTypeRepository roomTypeRepository, HotelService hotelService) {
        this.roomTypeRepository = roomTypeRepository;
        this.hotelService = hotelService;
    }

    public List<RoomTypeResponse> findByHotel(UUID hotelId) {
        hotelService.getEntity(hotelId); // 404 si el hotel no existe
        return roomTypeRepository.findByHotelIdOrderByBasePriceAsc(hotelId).stream()
                .map(RoomTypeMapper::toResponse)
                .toList();
    }

    public RoomTypeResponse findById(UUID id) {
        return RoomTypeMapper.toResponse(getEntity(id));
    }

    @Transactional
    public RoomTypeResponse create(UUID hotelId, CreateRoomTypeRequest request) {
        Hotel hotel = hotelService.getEntity(hotelId);
        String name = request.name().trim();
        if (roomTypeRepository.existsByHotelIdAndNameIgnoreCase(hotelId, name)) {
            throw new BusinessException("El hotel ya tiene un tipo de habitación llamado '" + name + "'");
        }
        RoomType roomType = new RoomType(hotel, name, request.description(), request.capacity(),
                request.basePrice());
        return RoomTypeMapper.toResponse(roomTypeRepository.save(roomType));
    }

    @Transactional
    public RoomTypeResponse update(UUID id, CreateRoomTypeRequest request) {
        RoomType roomType = getEntity(id);
        String name = request.name().trim();
        if (!roomType.getName().equalsIgnoreCase(name)
                && roomTypeRepository.existsByHotelIdAndNameIgnoreCase(roomType.getHotel().getId(), name)) {
            throw new BusinessException("El hotel ya tiene un tipo de habitación llamado '" + name + "'");
        }
        roomType.setName(name);
        roomType.setDescription(request.description());
        roomType.setCapacity(request.capacity());
        roomType.setBasePrice(request.basePrice());
        return RoomTypeMapper.toResponse(roomType);
    }

    /** Uso interno desde inventario y reservas. Carga también el hotel. */
    public RoomType getEntity(UUID id) {
        return roomTypeRepository.findWithHotelById(id)
                .orElseThrow(() -> NotFoundException.of("Tipo de habitación", id));
    }
}
