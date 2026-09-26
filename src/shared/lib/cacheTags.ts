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

import { cookies, draftMode } from 'next/headers';

// Opciones de `fetch` para lecturas públicas: en Next 16 el cacheo es opt-in,
// sin `force-cache` las etiquetas no sirven porque no hay entrada que invalidar.
export const siteCacheOptions = async (
  tenantDomain: string | undefined,
): Promise<Pick<RequestInit, 'cache' | 'headers'> & { next?: { tags: string[]; revalidate: number } }> => {
  if (tenantDomain === undefined) {
    // Llamada desde el navegador: no hay caché de servidor que etiquetar y
    // cachearla daría datos viejos al visitante.
    return { cache: 'no-store' };
  }

  let previewToken: string | undefined = undefined;
  try {
    const { isEnabled } = await draftMode();
    if (isEnabled) {
      previewToken = (await cookies()).get('preview_token')?.value;
    }
  } catch {
    // Fuera del contexto de una petición (e.g. scripts), ignoramos.
  }

  if (previewToken !== undefined) {
    // Modo vista previa: nunca cachear y enviar el token a la API
    return {
      cache: 'no-store',
      headers: { 'x-preview-token': previewToken },
    };
  }

  return {
    cache: 'force-cache',
    next: { tags: [tenantCacheTag(tenantDomain)], revalidate: SITE_CACHE_TTL_SECONDS },
  };
};
