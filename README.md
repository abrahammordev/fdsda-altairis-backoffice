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
| Backend       | Java 21 (Spring Boot) + Spring Data JPA                |
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
- Backend (API): <http://localhost:8080>
- Base de datos: PostgreSQL en el puerto 5432 (uso interno de los servicios)

## Módulos funcionales

- **Hoteles**: alta de hoteles con sus datos principales (nombre, dirección, ciudad, país, categoría), listado con búsqueda y paginación para soportar grandes volúmenes de registros.
- **Tipos de habitación**: creación de tipos de habitación asociados a un hotel (capacidad, descripción, precio base).
- **Disponibilidad e inventario**: registro de disponibilidad por tipo de habitación y fecha, con vistas (calendario/tabla) orientadas a la operativa diaria.
- **Reservas**: alta de reservas sobre un tipo de habitación/hotel, con fechas, estado y datos del cliente; panel de actividad y estado general de la operativa.

## Documentación adicional

- [Flujo del backend](docs/diagrama-backend.md)
- [Flujo del frontend](docs/diagrama-frontend.md)
- [Diagrama entidad-relación de la base de datos](docs/diagrama-er.md)
