package es.viajesaltairis.backoffice.hotel;

import es.viajesaltairis.backoffice.common.dto.PageResponse;
import es.viajesaltairis.backoffice.common.exception.NotFoundException;
import es.viajesaltairis.backoffice.hotel.dto.CreateHotelRequest;
import es.viajesaltairis.backoffice.hotel.dto.HotelResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    public PageResponse<HotelResponse> search(String search, String country, Short stars, Pageable pageable) {
        Specification<Hotel> spec = HotelSpecifications.textContains(search)
                .and(HotelSpecifications.countryEquals(country))
                .and(HotelSpecifications.starsEquals(stars));
        return PageResponse.from(hotelRepository.findAll(spec, pageable), HotelMapper::toResponse);
    }

    public HotelResponse findById(UUID id) {
        return HotelMapper.toResponse(getEntity(id));
    }

    @Transactional
    public HotelResponse create(CreateHotelRequest request) {
        Hotel saved = hotelRepository.save(HotelMapper.toEntity(request));
        return HotelMapper.toResponse(saved);
    }

    @Transactional
    public HotelResponse update(UUID id, CreateHotelRequest request) {
        Hotel hotel = getEntity(id);
        HotelMapper.update(hotel, request);
        return HotelMapper.toResponse(hotel);
    }

    /** Uso interno desde otros módulos (p. ej. tipos de habitación). */
    public Hotel getEntity(UUID id) {
        return hotelRepository.findById(id).orElseThrow(() -> NotFoundException.of("Hotel", id));
    }
}
