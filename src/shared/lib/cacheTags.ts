/**
 * Etiquetas de caché del contenido público (SPEC 0.2).
 *
 * Hay una sola etiqueta por dominio de tenant, no una por recurso: la
 * invalidación siempre ocurre "cambió algo de este cliente", nunca "cambió
 * solo su menú". Una etiqueta por recurso obligaría a la API a saber qué
 * tocó cada escritura para poder avisar bien, a cambio de nada.
 *
 * Que la clave sea el *dominio* y no el id del tenant es lo que garantiza el
 * aislamiento: el frontend nunca ve ids, solo el host de la visita. Un tenant
 * con varios dominios tiene varias etiquetas, y la API las invalida todas
 * juntas (ver `InvalidateTenantCacheUseCase`).
 */
const MAX_TAG_LENGTH = 256;

export const tenantCacheTag = (domain: string): string => {
  const tag = `t:${domain.toLowerCase()}`;
  // Next rechaza etiquetas de más de 256 caracteres. Un dominio válido llega
  // como mucho a 253, así que el recorte es defensa, no un caso real.
  return tag.slice(0, MAX_TAG_LENGTH);
};

/** Cuánto vive una respuesta cacheada si nadie la invalida antes (1 hora). */
export const SITE_CACHE_TTL_SECONDS = 3600;

/**
 * Opciones de `fetch` para cualquier lectura pública del sitio. En Next 16 el
 * cacheo es opt-in: sin `force-cache` las etiquetas no sirven de nada porque
 * no hay entrada que invalidar.
 */
export const siteCacheOptions = (
  tenantDomain: string | undefined,
): Pick<RequestInit, 'cache'> & { next?: { tags: string[]; revalidate: number } } => {
  if (tenantDomain === undefined) {
    // Llamada desde el navegador (sin dominio inyectado): no hay caché de
    // servidor que etiquetar y cachearla daría datos viejos al visitante.
    return { cache: 'no-store' };
  }
  return {
    cache: 'force-cache',
    next: { tags: [tenantCacheTag(tenantDomain)], revalidate: SITE_CACHE_TTL_SECONDS },
  };
};
