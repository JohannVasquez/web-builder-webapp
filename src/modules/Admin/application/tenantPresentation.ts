import type { Tenant, TenantStatus } from '../domain/AdminApi';

export interface TenantStatusOption {
  readonly value: TenantStatus;
  readonly label: string;
}

// Texto fijo en español para que el filtro, la insignia y el selector de estado usen las
// mismas palabras (SPEC 9.3).
export const TENANT_STATUS_OPTIONS: readonly TenantStatusOption[] = [
  { value: 'active', label: 'Activo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'building', label: 'En construcción' },
];

export interface TenantStatusPresentation {
  readonly label: string;
  readonly tone: TenantStatus;
}

// `demo` no es una opción del filtro de Clientes (la lista no trae demos), pero la ficha de un
// sitio puede ser la de una demo y tiene que decirlo con palabras.
const DEMO_STATUS_LABEL = 'Demo de prospecto';

export const describeTenantStatus = (status: TenantStatus): TenantStatusPresentation => ({
  label:
    status === 'demo'
      ? DEMO_STATUS_LABEL
      : (TENANT_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
        status),
  tone: status,
});

export type TenantStatusFilter = TenantStatus | 'all';

// Búsqueda por nombre o slug, combinada con el filtro de estado. Función pura para poder
// probarla sin montar la pantalla ni pedir datos a la API.
export const filterTenants = (
  tenants: readonly Tenant[],
  query: string,
  status: TenantStatusFilter,
): readonly Tenant[] => {
  const term = query.trim().toLowerCase();
  return tenants.filter((tenant) => {
    const matchesTerm =
      term === '' ||
      tenant.name.toLowerCase().includes(term) ||
      tenant.slug.toLowerCase().includes(term);
    const matchesStatus = status === 'all' || tenant.status === status;
    return matchesTerm && matchesStatus;
  });
};
