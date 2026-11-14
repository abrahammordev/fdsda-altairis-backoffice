# Backoffice Viajes Altairis

MVP de backoffice web fullstack para la gestión operativa de **Viajes Altairis**, grupo dedicado a la distribución hotelera y servicios turísticos B2B. La aplicación centraliza la gestión de hoteles, tipos de habitación, disponibilidad/inventario y reservas, sustituyendo los procesos fragmentados actuales por una herramienta única y navegable.

## Objetivo

Proporcionar al equipo de Altairis una herramienta que permita:

1. **Administrar hoteles**: alta, visualización y búsqueda, incluso con un volumen elevado de registros.
2. **Gestionar tipos de habitación**: asociación y consulta de los tipos de habitación disponibles en cada hotel.
3. **Gestionar disponibilidad e inventario**: registro de disponibilidad a lo largo del tiempo y vistas que faciliten su comprensión operativa.
4. **Gestionar reservas**: registro de reservas y consulta del estado general de la operativa diaria.

## Arquitectura y stack tecnológico

| Capa          | Tecnología                                             |
| ------------- | ------------------------------------------------------- |
| Backend       | Java 21, Spring Boot 4.1, Spring Data JPA, Flyway, springdoc (Swagger) |
| Frontend      | Next.js (React + TypeScript)                           |
| Base de datos | PostgreSQL                                             |
| Orquestación  | Docker / Docker Compose                                |

La solución se compone de tres servicios contenedorizados (backend, frontend y base de datos) orquestados mediante un único `docker-compose.yml`, sin requerir configuración adicional para levantarse en local.

## Estructura del repositorio

```text
.
├── backend/              API en Java 21/Spring Boot (controllers, servicios, repositorios, entidades JPA)
├── frontend/             Aplicación Next.js (páginas, componentes, cliente HTTP)
├── docs/                 Documentación funcional y técnica
│   ├── diagrama-backend.md
│   ├── diagrama-frontend.md
│   └── diagrama-er.md
├── docker-compose.yml
└── README.md
```

## Puesta en marcha

Requisitos previos: Docker y Docker Compose instalados.

```bash
docker-compose up --build
```

Esto levanta los tres servicios (base de datos, backend y frontend). Por defecto:

- Frontend: <http://localhost:3000>
- Backend (API): <http://localhost:8080> · Swagger UI: <http://localhost:8080/swagger-ui.html>
- Base de datos: PostgreSQL en el puerto 5432 (uso interno de los servicios)

Si el 8080 o el 5432 ya están ocupados en tu máquina, cambia el puerto publicado sin tocar nada más:

```bash
BACKEND_PORT=8081 DB_PORT=5433 docker compose up --build
```

Al arrancar, Flyway crea el esquema y carga datos de demo: 1.000 hoteles, ~3.000 tipos de habitación, 120 días de inventario (30 pasados y 90 futuros) para 20 hoteles y ~8.000 reservas coherentes con ese inventario. Las fechas son relativas al día del primer arranque; para regenerarlas, `docker compose down -v`.

## Backend: estructura

Paquetes por módulo funcional y, dentro de cada uno, las capas `Controller → Service → Repository`:

```text
backend/src/main/java/com/altairis/backoffice/
├── common/        ApiError + GlobalExceptionHandler, PageResponse, CORS, OpenAPI
├── hotel/         Hotel, HotelRepository, HotelSpecifications, HotelService, HotelController, HotelMapper, dto/
├── roomtype/      (misma forma)
├── inventory/     (misma forma)
├── reservation/   (misma forma) + ReservationStatus
└── dashboard/     DashboardService, DashboardController, dto/
```

- Las entidades JPA no salen del service: los controllers reciben y devuelven DTOs (`record`) validados con Bean Validation.
- Las reglas de negocio están en los services y en las propias entidades (`Inventory.reserve/release`, `Reservation.changeStatus`).
- Los errores siempre tienen la misma forma (`ApiError`): 400 validación, 404 no encontrado, 409 regla de negocio (p. ej. sin disponibilidad).
- El esquema lo gestiona Flyway (`db/migration`); Hibernate solo lo valida.

## API

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/api/hotels?search=&country=&stars=&page=&size=&sort=` | Listado paginado con búsqueda |
| POST / GET / PUT | `/api/hotels`, `/api/hotels/{id}` | Alta, detalle y edición |
| GET / POST | `/api/hotels/{hotelId}/room-types` | Tipos de habitación del hotel |
| GET / PUT | `/api/room-types/{id}` | Detalle y edición del tipo |
| PUT | `/api/room-types/{id}/inventory` | Cargar disponibilidad en un rango `{from, to, totalRooms, price?}` |
| GET | `/api/room-types/{id}/inventory?from=&to=` | Disponibilidad diaria del tipo |
| GET | `/api/hotels/{hotelId}/inventory?from=&to=` | Vista calendario del hotel |
| GET | `/api/reservations?search=&status=&hotelId=&from=&to=` | Listado paginado de reservas |
| POST | `/api/reservations` | Alta: comprueba y descuenta disponibilidad noche a noche |
| PATCH | `/api/reservations/{id}/status` | Confirmar o cancelar (cancelar libera inventario) |
| GET | `/api/dashboard/summary?date=` | KPIs del día: llegadas, salidas, alojados, ocupación, estados |
| GET | `/api/dashboard/occupancy?from=&to=` | Serie diaria de ocupación y llegadas para gráficas |

## Tests

Los tests de integración usan Testcontainers (PostgreSQL real), así que necesitan Docker. Con JDK 21 instalado:

```bash
cd backend && ./mvnw test
```

## Módulos funcionales

- **Hoteles**: alta de hoteles con sus datos principales (nombre, dirección, ciudad, país, categoría), listado con búsqueda y paginación para soportar grandes volúmenes de registros.
- **Tipos de habitación**: creación de tipos de habitación asociados a un hotel (capacidad, descripción, precio base).
- **Disponibilidad e inventario**: registro de disponibilidad por tipo de habitación y fecha, con vistas (calendario/tabla) orientadas a la operativa diaria.
- **Reservas**: alta de reservas sobre un tipo de habitación/hotel, con fechas, estado y datos del cliente; panel de actividad y estado general de la operativa.

## Documentación adicional

- [Flujo del backend](docs/diagrama-backend.md)
- [Flujo del frontend](docs/diagrama-frontend.md)
- [Diagrama entidad-relación de la base de datos](docs/diagrama-er.md)
