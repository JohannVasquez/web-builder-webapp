/**
 * Dirección ESTABLE de una imagen del bucket. Las URLs firmadas que manda la API caducan en
 * una hora: si se le pasan a `next/image`, el optimizador vuelve a trabajar con cada firma
 * nueva y el resultado cacheado no se reaprovecha nunca.
 *
 * `/api/media/<clave>` lo sirve la API bajo el mismo host del sitio (ver el `handle /api/*`
 * del Caddyfile), comprueba que la clave sea de ese cliente y redirige a una firma fresca.
 */
export const mediaSrc = (key: string | null | undefined): string | null => {
  if (key === null || key === undefined || key.trim() === '') {
    return null;
  }
  // Lo que ya es una URL absoluta se deja pasar: hay contenido con imágenes externas pegadas
  // a mano, y reescribirlas las rompería.
  if (/^https?:\/\//.test(key)) {
    return key;
  }
  return `/api/media/${encodeURIComponent(key)}`;
};
