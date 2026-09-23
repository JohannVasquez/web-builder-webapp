import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // La versión de Next no es información que nadie necesite para visitar un sitio.
  poweredByHeader: false,
  images: {
    /**
     * `/api/media/<clave>` responde un 307 al bucket, así que el optimizador termina pidiendo
     * ese host. Cuál es depende del despliegue (MinIO en local, R2 en producción), por eso no
     * se fija aquí: lo acota la propia ruta, que solo firma claves del cliente que pregunta.
     */
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
};

export default nextConfig;
