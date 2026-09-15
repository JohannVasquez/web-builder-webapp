// Etiquetas de caché del contenido público (SPEC 0.2): una por dominio de tenant, no por
// recurso, para invalidar todo el tenant de una vez (ver `InvalidateTenantCacheUseCase`).
const MAX_TAG_LENGTH = 256;

export const tenantCacheTag = (domain: string): string => {
  const tag = `t:${domain.toLowerCase()}`;
  // Next rechaza etiquetas de más de 256 caracteres; un dominio real llega como mucho a 253.
  return tag.slice(0, MAX_TAG_LENGTH);
};

// Cuánto vive una respuesta cacheada si nadie la invalida antes (1 hora).
export const SITE_CACHE_TTL_SECONDS = 3600;

// Opciones de `fetch` para lecturas públicas: en Next 16 el cacheo es opt-in,
// sin `force-cache` las etiquetas no sirven porque no hay entrada que invalidar.
export const siteCacheOptions = (
  tenantDomain: string | undefined,
): Pick<RequestInit, 'cache'> & { next?: { tags: string[]; revalidate: number } } => {
  if (tenantDomain === undefined) {
    // Llamada desde el navegador: no hay caché de servidor que etiquetar y
    // cachearla daría datos viejos al visitante.
    return { cache: 'no-store' };
  }
  return {
    cache: 'force-cache',
    next: { tags: [tenantCacheTag(tenantDomain)], revalidate: SITE_CACHE_TTL_SECONDS },
  };
};
