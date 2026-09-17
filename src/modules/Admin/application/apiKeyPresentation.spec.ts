import {
  describeApiKeyScope,
  describeApiKeyStatus,
  permissionLabel,
} from './apiKeyPresentation';
import type { Tenant } from '../domain/AdminApi';

const tenants: Tenant[] = [
  { id: 1, slug: 'acme', name: 'Acme', primaryDomain: null, status: 'active' },
  { id: 2, slug: 'globex', name: 'Globex', primaryDomain: null, status: 'active' },
];

describe('describeApiKeyScope', () => {
  it('dice "Todos los clientes" cuando el alcance es global', () => {
    expect(describeApiKeyScope({ scopeAllTenants: true, tenantIds: [] }, tenants)).toBe(
      'Todos los clientes',
    );
  });

  it('lista los nombres de los clientes del alcance', () => {
    expect(
      describeApiKeyScope({ scopeAllTenants: false, tenantIds: [2, 1] }, tenants),
    ).toBe('Globex, Acme');
  });

  it('marca como "Cliente eliminado" un id que ya no existe', () => {
    expect(
      describeApiKeyScope({ scopeAllTenants: false, tenantIds: [1, 999] }, tenants),
    ).toBe('Acme, Cliente eliminado');
  });

  it('dice "Ningún cliente" cuando el alcance quedó vacío', () => {
    expect(describeApiKeyScope({ scopeAllTenants: false, tenantIds: [] }, tenants)).toBe(
      'Ningún cliente',
    );
  });
});

describe('describeApiKeyStatus', () => {
  it('marca una clave activa como usable', () => {
    expect(describeApiKeyStatus('active')).toEqual({
      label: 'Activa',
      tone: 'active',
      isUsable: true,
    });
  });

  it('marca una clave revocada como no usable', () => {
    expect(describeApiKeyStatus('revoked')).toEqual({
      label: 'Revocada',
      tone: 'revoked',
      isUsable: false,
    });
  });

  it('marca una clave vencida como no usable', () => {
    expect(describeApiKeyStatus('expired')).toEqual({
      label: 'Vencida',
      tone: 'expired',
      isUsable: false,
    });
  });
});

describe('permissionLabel', () => {
  it('traduce el permiso a su etiqueta en español', () => {
    expect(permissionLabel('read')).toBe('Lectura');
    expect(permissionLabel('write')).toBe('Escritura');
    expect(permissionLabel('full')).toBe('Total');
  });
});
