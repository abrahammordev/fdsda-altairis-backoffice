# Flujo del Backend

API en Java 21 (Spring Boot) organizada en capas: controllers, validación, servicios de negocio y repositorios sobre Spring Data JPA.

## Arquitectura por capas

```mermaid
flowchart TD
    Client[Frontend Next.js / cliente HTTP]

    subgraph API["Spring Boot API"]
        MW[Filtros: CORS, logging, manejo global de excepciones]
        Ctrl[Controllers<br/>Hoteles · Tipos de habitación · Inventario · Reservas]
        Val[Validación de DTOs de entrada]
        Svc[Servicios de negocio<br/>reglas de disponibilidad y reservas]
        Repo[Repositorios<br/>Spring Data JPA]
    end

    DB[(PostgreSQL)]

    Client -->|HTTP Request JSON| MW
    MW --> Ctrl
    Ctrl --> Val
    Val --> Svc
    Svc --> Repo
    Repo --> DB
    DB --> Repo
    Repo --> Svc
    Svc --> Ctrl
    Ctrl -->|HTTP Response JSON| Client
```

## Flujo detallado: alta de una reserva

Antes de confirmar una reserva, el backend comprueba que haya disponibilidad para las fechas solicitadas y, si la hay, descuenta el inventario correspondiente.

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant BaseDeDatos as Base de datos

    Frontend->>Backend: Crear reserva (hotel, habitación, fechas)
    Backend->>BaseDeDatos: ¿Hay disponibilidad?
    BaseDeDatos-->>Backend: Disponibilidad

    alt Hay disponibilidad
        Backend->>BaseDeDatos: Guardar reserva y actualizar inventario
        Backend-->>Frontend: Reserva confirmada
    else Sin disponibilidad
        Backend-->>Frontend: Error: no hay habitaciones disponibles
    end
```

## Responsabilidades por capa

- **Controllers**: exponen los endpoints REST por módulo (hoteles, tipos de habitación, inventario, reservas) y traducen peticiones/respuestas HTTP.
- **Validación**: comprueba la integridad de los datos de entrada antes de llegar a la lógica de negocio.
- **Servicios**: contienen las reglas de negocio (p. ej. comprobación de disponibilidad antes de confirmar una reserva, cálculo de estado de la operativa).
- **Repositorios**: acceso a datos vía Spring Data JPA (Hibernate), aislando al resto de capas del detalle de persistencia.
