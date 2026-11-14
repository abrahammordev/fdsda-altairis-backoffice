-- Esquema inicial del backoffice Altairis (ver docs/diagrama-er.md)

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE hotel (
    id          UUID PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    address     VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    country     VARCHAR(100) NOT NULL,
    stars       SMALLINT     NOT NULL CHECK (stars BETWEEN 1 AND 5),
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Búsqueda parcial (ILIKE '%texto%') eficiente con miles de hoteles
CREATE INDEX idx_hotel_name_trgm ON hotel USING gin (name gin_trgm_ops);
CREATE INDEX idx_hotel_city_trgm ON hotel USING gin (city gin_trgm_ops);
CREATE INDEX idx_hotel_country   ON hotel (country);

CREATE TABLE room_type (
    id          UUID PRIMARY KEY,
    hotel_id    UUID          NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    name        VARCHAR(100)  NOT NULL,
    description TEXT,
    capacity    SMALLINT      NOT NULL CHECK (capacity > 0),
    base_price  NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    CONSTRAINT uq_room_type_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_room_type_hotel ON room_type (hotel_id);

CREATE TABLE inventory (
    id              UUID PRIMARY KEY,
    room_type_id    UUID           NOT NULL REFERENCES room_type (id) ON DELETE CASCADE,
    date            DATE           NOT NULL,
    total_rooms     INTEGER        NOT NULL CHECK (total_rooms >= 0),
    available_rooms INTEGER        NOT NULL CHECK (available_rooms >= 0),
    price           NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    CONSTRAINT uq_inventory_room_type_date UNIQUE (room_type_id, date),
    CONSTRAINT ck_inventory_available CHECK (available_rooms <= total_rooms)
);

CREATE INDEX idx_inventory_date ON inventory (date);

CREATE TABLE reservation (
    id           UUID PRIMARY KEY,
    room_type_id UUID           NOT NULL REFERENCES room_type (id),
    guest_name   VARCHAR(150)   NOT NULL,
    guest_email  VARCHAR(150)   NOT NULL,
    guest_phone  VARCHAR(30),
    check_in     DATE           NOT NULL,
    check_out    DATE           NOT NULL,
    rooms_count  INTEGER        NOT NULL CHECK (rooms_count > 0),
    status       VARCHAR(20)    NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    total_price  NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
    CONSTRAINT ck_reservation_dates CHECK (check_out > check_in)
);

CREATE INDEX idx_reservation_room_type ON reservation (room_type_id);
CREATE INDEX idx_reservation_check_in  ON reservation (check_in);
CREATE INDEX idx_reservation_check_out ON reservation (check_out);
CREATE INDEX idx_reservation_status    ON reservation (status);
CREATE INDEX idx_reservation_created   ON reservation (created_at DESC);
