import type { NextConfig } from 'next';

/**
 * Orígenes de los que este sitio carga scripts de terceros. Solo se activan con
 * consentimiento (ver el módulo `Consent`), pero la política tiene que contemplarlos igual:
 * una política que bloquea lo que el propio sitio carga se termina desactivando entera.
 */
const TRACKER_ORIGINS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://connect.facebook.net',
];

const IMAGE_ORIGINS = ['https://www.facebook.com', 'https://www.google-analytics.com'];

/**
 * Se publica en modo SOLO REPORTE a propósito. Una política de contenido mal calibrada rompe
 * el sitio de todos los clientes a la vez, y aquí el contenido lo arma cada cliente: hasta
 * saber qué está cargando cada uno, conviene observar antes de bloquear.
 *
 * `unsafe-inline` en `script-src` es lo que hoy exigen el arranque de Next y los fragmentos
 * de analítica; quitarlo pide pasar a nonces, que es el siguiente paso una vez que los
 * informes estén limpios.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${TRACKER_ORIGINS.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: https: ${IMAGE_ORIGINS.join(' ')}`,
  "connect-src 'self' https:",
  "frame-src 'self' https://www.google.com https://www.youtube.com",
  // El sitio de un cliente nunca tiene por qué aparecer dentro de un iframe ajeno.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  // Un año y subdominios: los sitios se sirven siempre por HTTPS (ver `caddy/Caddyfile.prod`).
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Sin esto, un archivo subido por un cliente puede ejecutarse como el tipo que el navegador
  // adivine en vez del que declara el servidor.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Nada de esto lo usa un sitio de la plataforma; negarlo evita que lo pida un script de un
  // tercero que el cliente haya pegado.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // La versión de Next no es información que nadie necesite para visitar un sitio.
  poweredByHeader: false,
  // Sin esto Next le quita al proxy las cabeceras de las peticiones RSC, y el proxy no puede
  // distinguir la precarga de un enlace de una visita real a una demo (ver `src/proxy.ts`).
  // Normalizar la URL solo sirve a `/_next/data` del Pages Router, que este proyecto no usa.
  skipProxyUrlNormalize: true,
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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
