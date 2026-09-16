import type { ApiKey, ApiKeyStatus, Tenant } from '../domain/AdminApi';

export interface PermissionOption {
  readonly value: ApiKey['permission'];
  readonly label: string;
  readonly description: string;
}

// Texto fijo en español para que el formulario y el listado usen las mismas palabras.
export const PERMISSION_OPTIONS: readonly PermissionOption[] = [
  {
    value: 'read',
    label: 'Lectura',
    description: 'Solo puede leer datos; no puede crear ni modificar nada.',
  },
  {
    value: 'write',
    label: 'Escritura',
    description: 'Puede leer y también crear o modificar contenido dentro de su alcance.',
  },
  {
    value: 'full',
    label: 'Total',
    description: 'Acceso completo, incluida la gestión de clientes y de otras claves.',
  },
];

export const permissionLabel = (permission: ApiKey['permission']): string =>
  PERMISSION_OPTIONS.find((option) => option.value === permission)?.label ?? permission;

// `scopeAllTenants` gana: una clave "para todos" no necesita mirar `tenantIds`.
// Un id que ya no tiene cliente (borrado después de crear la clave) se marca en vez de omitirse.
export const describeApiKeyScope = (
  apiKey: Pick<ApiKey, 'scopeAllTenants' | 'tenantIds'>,
  tenants: readonly Tenant[],
): string => {
  if (apiKey.scopeAllTenants) {
    return 'Todos los clientes';
  }
  if (apiKey.tenantIds.length === 0) {
    return 'Ningún cliente';
  }
  const nameById = new Map(tenants.map((tenant) => [tenant.id, tenant.name]));
  return apiKey.tenantIds.map((id) => nameById.get(id) ?? 'Cliente eliminado').join(', ');
};

export interface ApiKeyStatusPresentation {
  readonly label: string;
  readonly tone: 'active' | 'revoked' | 'expired';
  readonly isUsable: boolean;
}

export const describeApiKeyStatus = (status: ApiKeyStatus): ApiKeyStatusPresentation => {
  if (status === 'revoked') {
    return { label: 'Revocada', tone: 'revoked', isUsable: false };
  }
  if (status === 'expired') {
    return { label: 'Vencida', tone: 'expired', isUsable: false };
  }
  return { label: 'Activa', tone: 'active', isUsable: true };
};
