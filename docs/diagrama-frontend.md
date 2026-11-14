# Flujo del Frontend

Aplicación Next.js 16 (App Router, React 19 + TypeScript) organizada por módulos funcionales. El navegador solo habla con Next.js, que reenvía `/api/*` al backend.

## Navegación y módulos

```mermaid
flowchart TD
    Nav[Cabecera con pestañas<br/>Dashboard · Reservas · Inventario · Hoteles]

    subgraph Rutas["Rutas"]
        Hoy["/ — Operativa de hoy<br/>cifras del día y gráficas"]
        Res["/reservations<br/>listado, alta, edición, confirmar y cancelar"]
        Inv["/inventory<br/>calendario de ocupación por hotel"]
        Hot["/hotels<br/>listado, búsqueda y alta"]
        Det["/hotels/[id]<br/>tipos de habitación (alta y edición) y disponibilidad"]
    end

    Query[TanStack Query<br/>caché, reintentos, estados de carga]
    Proxy[Next.js<br/>rewrite /api/* → backend]
    Backend[("API Spring Boot")]

    Nav --> Hoy & Res & Inv & Hot
    Hot --> Det
    Hoy & Res & Inv & Hot & Det --> Query
    Query -->|fetch /api/...| Proxy
    Proxy -->|red interna de Docker| Backend
```

## Flujo de datos de una vista (ejemplo: Inventario)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant P as Página /inventory
    participant Q as TanStack Query
    participant N as Next.js (proxy)
    participant BE as Backend

    U->>P: Elige hotel y semana
    P->>P: Muestra skeleton del calendario
    P->>Q: useQuery(["inventory", hotel, desde, hasta])
    Q->>N: GET /api/hotels/{id}/inventory?from&to
    N->>BE: Reenvía la petición
    BE-->>N: Días por tipo de habitación
    N-->>Q: JSON
    Q-->>P: Datos (en caché para volver atrás sin recargar)
    P-->>U: Mapa de calor de ocupación
    Note over Q,N: Si el backend no responde, se reintenta<br/>manteniendo el skeleton y un aviso de conexión
```

## Principios de diseño

- **Por módulo**: `src/features/<módulo>` agrupa las vistas y formularios de cada área; `src/app` solo define las rutas.
- **Carga previa visible**: cada página tiene un esqueleto completo como fallback de `Suspense` y cada bloque su propio skeleton mientras llegan los datos.
- **Lectura rápida**: la portada resume el día en una franja de cifras (ocupación, entradas, salidas, estancias activas) y gráficas de evolución.
- **Errores comprensibles**: los fallos de negocio del backend (p. ej. sin disponibilidad) se muestran dentro del formulario o en diálogos nativos; los fallos transitorios se reintentan solos.
- **Volumen elevado**: los listados paginan y filtran en el servidor; el buscador de hoteles sugiere resultados mientras se escribe.
