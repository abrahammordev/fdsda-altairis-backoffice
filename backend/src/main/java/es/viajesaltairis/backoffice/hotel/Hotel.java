package es.viajesaltairis.backoffice.hotel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Hotel del catálogo. Raíz del modelo: tiene tipos de habitación. */
@Entity
@Table(name = "hotel")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Hotel {

    @Id
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false)
    private short stars;

    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Hotel(String name, String address, String city, String country, short stars, String description) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.address = address;
        this.city = city;
        this.country = country;
        this.stars = stars;
        this.description = description;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
