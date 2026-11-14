package es.viajesaltairis.backoffice.hotel;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** Acceso a hoteles. Las búsquedas dinámicas se construyen con {@link HotelSpecifications}. */
public interface HotelRepository extends JpaRepository<Hotel, UUID>, JpaSpecificationExecutor<Hotel> {
}
