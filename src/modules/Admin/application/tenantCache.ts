import { refreshAsyncData } from '@/shared/lib/useAsyncData';

export const TENANTS_CACHE_KEY = 'admin:tenants';

// La API no lista las demos entre los clientes salvo que se pida. La ficha de un sitio sí las
// necesita: "Editar sitio" desde una demo lleva a esa ficha con el tenant de la demo.
export const TENANTS_WITH_DEMOS_CACHE_KEY = 'admin:tenants:with-demos';

// Crear, convertir o borrar cambia las dos listas: una demo convertida pasa a Clientes y una
// recién creada tiene que encontrarse al ir a editar su sitio.
export const refreshTenantLists = (): void => {
  refreshAsyncData(TENANTS_CACHE_KEY);
  refreshAsyncData(TENANTS_WITH_DEMOS_CACHE_KEY);
};
