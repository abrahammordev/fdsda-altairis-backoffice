-- Datos de demo: 1.000 hoteles, sus tipos de habitación, inventario de 120 días
-- (para los 20 primeros hoteles) y ~8.000 reservas coherentes con ese inventario (ocupación ~60 %).
-- Las fechas son relativas a la fecha en que se aplica la migración.

SELECT setseed(0.42);

-- ---------------------------------------------------------------- Hoteles
CREATE TEMP TABLE seed_hotel AS
WITH cities(idx, city, country) AS (
    VALUES (1, 'Madrid', 'España'), (2, 'Barcelona', 'España'), (3, 'Sevilla', 'España'),
           (4, 'Valencia', 'España'), (5, 'Málaga', 'España'), (6, 'Palma', 'España'),
           (7, 'Lisboa', 'Portugal'), (8, 'Oporto', 'Portugal'), (9, 'París', 'Francia'),
           (10, 'Niza', 'Francia'), (11, 'Roma', 'Italia'), (12, 'Milán', 'Italia'),
           (13, 'Florencia', 'Italia'), (14, 'Londres', 'Reino Unido'), (15, 'Berlín', 'Alemania'),
           (16, 'Ámsterdam', 'Países Bajos'), (17, 'Cancún', 'México'), (18, 'Ciudad de México', 'México'),
           (19, 'Buenos Aires', 'Argentina'), (20, 'Nueva York', 'Estados Unidos')
),
raw AS (
    SELECT g AS n,
           1 + floor(random() * 20)::int AS city_idx,
           1 + floor(random() * 12)::int AS prefix_idx,
           1 + floor(random() * 14)::int AS suffix_idx,
           (ARRAY[2, 3, 3, 4, 4, 4, 5])[1 + floor(random() * 7)::int] AS stars,
           1 + floor(random() * 250)::int AS street_no,
           now() - (random() * interval '730 days') AS created_at
    FROM generate_series(1, 1000) AS g
)
SELECT r.n,
       gen_random_uuid() AS id,
       (ARRAY['Hotel', 'Gran Hotel', 'Hostal', 'Resort', 'Boutique Hotel', 'Apartahotel',
              'Palacio', 'Posada', 'Parador', 'Suites', 'Hotel Spa', 'Lodge'])[r.prefix_idx]
           || ' ' ||
       (ARRAY['Mirador', 'Central', 'Las Palmeras', 'del Mar', 'Plaza', 'Real', 'Altamira',
              'Sol', 'Atlántico', 'Jardín', 'Imperial', 'Bahía', 'Monumental', 'Aurora'])[r.suffix_idx]
           || ' ' || c.city || ' ' || r.n AS name,
       (ARRAY['Calle Mayor', 'Avenida del Puerto', 'Paseo Marítimo', 'Calle Real',
              'Plaza Central', 'Avenida Libertad'])[1 + (r.n % 6)] || ', ' || r.street_no AS address,
       c.city,
       c.country,
       r.stars,
       'Hotel de ' || r.stars || ' estrellas situado en ' || c.city || '.' AS description,
       r.created_at
FROM raw r
JOIN cities c ON c.idx = r.city_idx;

INSERT INTO hotel (id, name, address, city, country, stars, description, created_at)
SELECT id, name, address, city, country, stars, description, created_at FROM seed_hotel;

-- ------------------------------------------------------ Tipos de habitación
-- Cada hotel recibe entre 2 y 4 tipos; precio base escalado por estrellas.
CREATE TEMP TABLE seed_room_type AS
WITH catalog(ord, name, capacity, price, description) AS (
    VALUES (1, 'Doble', 2, 90, 'Habitación doble estándar'),
           (2, 'Individual', 1, 60, 'Habitación individual'),
           (3, 'Doble Superior', 2, 125, 'Doble con vistas y mejores acabados'),
           (4, 'Suite', 2, 220, 'Suite con salón independiente')
)
SELECT h.n AS hotel_n,
       gen_random_uuid() AS id,
       h.id AS hotel_id,
       c.name,
       c.description,
       c.capacity,
       round((c.price * (0.55 + h.stars * 0.15))::numeric, 2) AS base_price,
       4 + floor(random() * 9)::int AS rooms_total
FROM seed_hotel h
JOIN catalog c ON c.ord <= 2 + (h.n % 3);

INSERT INTO room_type (id, hotel_id, name, description, capacity, base_price)
SELECT id, hotel_id, name, description, capacity, base_price FROM seed_room_type;

-- --------------------------------------------------------------- Inventario
-- 120 días (30 pasados + 90 futuros) para los hoteles 1..20. Fin de semana +20 %.
INSERT INTO inventory (id, room_type_id, date, total_rooms, available_rooms, price)
SELECT gen_random_uuid(),
       rt.id,
       d::date,
       rt.rooms_total,
       rt.rooms_total,
       round(rt.base_price * CASE WHEN extract(isodow FROM d) IN (5, 6) THEN 1.2 ELSE 1 END, 2)
FROM seed_room_type rt
CROSS JOIN generate_series(current_date - 30, current_date + 89, interval '1 day') AS d
WHERE rt.hotel_n <= 20;

-- ----------------------------------------------------------------- Reservas
CREATE TEMP TABLE seed_pool AS
SELECT row_number() OVER (ORDER BY rt.id) AS idx, rt.id
FROM seed_room_type rt
WHERE rt.hotel_n <= 20;

CREATE TEMP TABLE seed_reservation AS
WITH params AS (
    SELECT g,
           1 + floor(random() * (SELECT count(*) FROM seed_pool))::int AS pool_idx,
           current_date - 30 + floor(random() * 112)::int AS check_in,
           1 + floor(random() * 5)::int AS nights,
           1 + floor(random() * 2)::int AS rooms_count,
           random() AS status_roll,
           random() AS created_roll,
           1 + floor(random() * 16)::int AS first_idx,
           1 + floor(random() * 16)::int AS last_idx
    FROM generate_series(1, 8000) AS g
)
SELECT gen_random_uuid() AS id,
       p.id AS room_type_id,
       x.first_name || ' ' || x.last_name AS guest_name,
       lower(translate(x.first_name || '.' || x.last_name || g, 'áéíóúñ', 'aeioun')) || '@example.com' AS guest_email,
       '+34 6' || lpad((floor(random() * 100000000))::text, 8, '0') AS guest_phone,
       pr.check_in,
       least(pr.check_in + pr.nights, current_date + 90) AS check_out,
       pr.rooms_count,
       CASE
           WHEN pr.status_roll < 0.10 THEN 'CANCELLED'
           WHEN pr.status_roll < 0.22 AND pr.check_in >= current_date THEN 'PENDING'
           ELSE 'CONFIRMED'
       END AS status,
       CASE
           WHEN pr.created_roll < 0.003 THEN now() - (random() * interval '8 hours')
           ELSE (least(pr.check_in - (1 + floor(random() * 45)::int), current_date - 1 - floor(random() * 20)::int))::timestamp
                + interval '8 hours' + random() * interval '14 hours'
       END AS created_at
FROM params pr
JOIN seed_pool p ON p.idx = pr.pool_idx
CROSS JOIN LATERAL (
    SELECT (ARRAY['Lucía', 'Hugo', 'Martina', 'Mateo', 'Sofía', 'Leo', 'Julia', 'Daniel',
                  'Paula', 'Pablo', 'Emma', 'Álvaro', 'Carla', 'Marco', 'Laura', 'Thomas'])[pr.first_idx] AS first_name,
           (ARRAY['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Gómez', 'Fernández', 'Díaz',
                  'Moreno', 'Romero', 'Silva', 'Rossi', 'Dubois', 'Müller', 'Smith', 'Ruiz'])[pr.last_idx] AS last_name
) x;

-- Ajuste de capacidad: si en algún día la demanda sembrada supera el total, se amplía el total
UPDATE inventory i
SET total_rooms = greatest(i.total_rooms, b.booked)
FROM (
    SELECT inv.id, sum(r.rooms_count) AS booked
    FROM inventory inv
    JOIN seed_reservation r ON r.room_type_id = inv.room_type_id
                           AND inv.date >= r.check_in AND inv.date < r.check_out
                           AND r.status <> 'CANCELLED'
    GROUP BY inv.id
) b
WHERE b.id = i.id;

UPDATE inventory i
SET available_rooms = i.total_rooms - b.booked
FROM (
    SELECT inv.id, sum(r.rooms_count) AS booked
    FROM inventory inv
    JOIN seed_reservation r ON r.room_type_id = inv.room_type_id
                           AND inv.date >= r.check_in AND inv.date < r.check_out
                           AND r.status <> 'CANCELLED'
    GROUP BY inv.id
) b
WHERE b.id = i.id;

INSERT INTO reservation (id, room_type_id, guest_name, guest_email, guest_phone, check_in, check_out,
                         rooms_count, status, total_price, created_at)
SELECT r.id, r.room_type_id, r.guest_name, r.guest_email, r.guest_phone, r.check_in, r.check_out,
       r.rooms_count, r.status,
       coalesce((SELECT sum(i.price) FROM inventory i
                 WHERE i.room_type_id = r.room_type_id
                   AND i.date >= r.check_in AND i.date < r.check_out), 0) * r.rooms_count,
       r.created_at
FROM seed_reservation r;

DROP TABLE seed_reservation;
DROP TABLE seed_pool;
DROP TABLE seed_room_type;
DROP TABLE seed_hotel;
