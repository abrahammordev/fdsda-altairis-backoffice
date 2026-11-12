# Flujo del Frontend

Aplicación Next.js (React + TypeScript) organizada por módulos funcionales, cada uno consumiendo la API del backend a través de un cliente HTTP compartido.

## Navegación y módulos

```mermaid
flowchart TD
    Login[Acceso al backoffice]
    Dash[Panel operativo<br/>estado general y gráficos]

    subgraph Modulos["Módulos funcionales"]
        Hoteles[Hoteles<br/>listado, búsqueda, alta]
        Habitaciones[Tipos de habitación<br/>por hotel]
        Inventario[Disponibilidad e inventario<br/>vista calendario/tabla]
        Reservas[Reservas<br/>alta y consulta]
    end

    Client[Cliente HTTP<br/>fetch/SWR hacia la API]
    Backend[("API Spring Boot")]

    Login --> Dash
    Dash --> Hoteles
    Dash --> Inventario
    Dash --> Reservas

    Hoteles --> Habitaciones
    Habitaciones --> Inventario
    Inventario --> Reservas

    Hoteles --> Client
    Habitaciones --> Client
    Inventario --> Client
    Reservas --> Client
    Dash --> Client

    Client -->|REST/JSON| Backend
    Backend -->|REST/JSON| Client
```

## Flujo de datos de una vista (ejemplo: Inventario)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant P as Página Inventario
    participant H as Hook de datos (SWR)
    participant API as Cliente HTTP
    participant BE as Backend

    U->>P: Selecciona hotel / tipo de habitación / rango de fechas
    P->>H: Solicita disponibilidad
    H->>API: Solicita disponibilidad (filtros)
    API->>BE: Petición HTTP
    BE-->>API: Datos de disponibilidad
    API-->>H: Respuesta JSON
    H-->>P: Datos normalizados
    P-->>U: Vista de calendario/tabla con estado de ocupación
```

## Principios de diseño

- **Por módulo**: cada módulo funcional (hoteles, tipos de habitación, inventario, reservas) tiene sus propias páginas, componentes y llamadas a la API.
- **Panel operativo**: página de inicio con indicadores y gráficos del estado general de la operativa (ocupación, reservas del día), pensada para la lectura rápida durante la operación diaria.
- **Capa de datos común**: un único cliente HTTP centraliza las llamadas al backend, facilitando el manejo de errores y la reutilización entre módulos.
- **Listados con búsqueda y paginación**: las vistas de hoteles e inventario soportan búsqueda y paginación para trabajar con volúmenes elevados de registros.
