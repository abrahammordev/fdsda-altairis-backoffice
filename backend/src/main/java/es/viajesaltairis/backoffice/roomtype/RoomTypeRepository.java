package es.viajesaltairis.backoffice.roomtype;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {

    @EntityGraph(attributePaths = "hotel")
    List<RoomType> findByHotelIdOrderByBasePriceAsc(UUID hotelId);

    @EntityGraph(attributePaths = "hotel")
    Optional<RoomType> findWithHotelById(UUID id);

    boolean existsByHotelIdAndNameIgnoreCase(UUID hotelId, String name);
}
