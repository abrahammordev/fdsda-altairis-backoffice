import type { NextConfig } from "next";

// URL del backend Spring Boot. Se resuelve en el build (las rewrites se serializan en el servidor).
// En Docker se pasa como build arg; en local apunta al backend levantado con docker compose.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // El navegador llama a /api/* en el mismo origen y Next lo reenvía al backend: sin CORS ni puertos expuestos.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
