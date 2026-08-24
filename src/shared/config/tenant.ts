/**
 * Header con el que la API resuelve el tenant de la petición. El valor sale
 * del segmento `[tenantDomain]` de la ruta, que `proxy.ts` rellena con el
 * `Host` de la visita; la API descarta el puerto y busca el dominio entre los
 * de `tenant_domains`.
 *
 * Ya no se lee con `headers()`: hacerlo dentro de un server component marcaba
 * la ruta como dinámica e impedía prerenderizarla.
 */
export const TENANT_DOMAIN_HEADER = 'X-Tenant-Domain';
