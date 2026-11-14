# Frontend · Altairis Backoffice

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4. Ver el README de la raíz para la estructura y la puesta en marcha con Docker.

## Desarrollo local

Con el backend levantado (`docker compose up -d db backend`), desde esta carpeta:

```bash
npm install
```

```bash
BACKEND_URL=http://localhost:8080 npm run dev
```

`BACKEND_URL` indica a dónde reenvía Next las peticiones `/api/*` (ver `next.config.ts`). Si el backend está publicado en otro puerto, cámbialo aquí.

## Comprobaciones

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

```bash
npm run build
```

El build es la prueba más completa: con Cache Components, Next.js falla si algún componente lee datos de la petición o la hora fuera de un `Suspense`.
