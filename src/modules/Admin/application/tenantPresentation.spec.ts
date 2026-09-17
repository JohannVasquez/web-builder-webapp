import {
  TENANT_STATUS_OPTIONS,
  describeTenantStatus,
  filterTenants,
} from './tenantPresentation';
import type { Tenant } from '../domain/AdminApi';

const active: Tenant = {
  id: 1,
  slug: 'acme',
  name: 'Acme',
  primaryDomain: 'acme.cl',
  status: 'active',
};

const paused: Tenant = {
  id: 2,
  slug: 'electrica',
  name: 'Eléctrica del Sur',
  primaryDomain: null,
  status: 'paused',
};

const building: Tenant = {
  id: 3,
  slug: 'pasteleria-luna',
  name: 'Pastelería Luna',
  primaryDomain: null,
  status: 'building',
};

const tenants = [active, paused, building];

describe('describeTenantStatus', () => {
  it('etiqueta cada uno de los tres estados', () => {
    expect(describeTenantStatus('active').label).toBe('Activo');
    expect(describeTenantStatus('paused').label).toBe('Pausado');
    expect(describeTenantStatus('building').label).toBe('En construcción');
  });

  it('cubre exactamente los estados del selector', () => {
    const statuses = TENANT_STATUS_OPTIONS.map((option) => option.value);
    expect(statuses).toEqual(['active', 'paused', 'building']);
  });
});

describe('filterTenants', () => {
  it('sin filtros devuelve todos los clientes', () => {
    expect(filterTenants(tenants, '', 'all')).toEqual(tenants);
  });

  it('filtra por texto en el nombre', () => {
    expect(filterTenants(tenants, 'eléctrica', 'all')).toEqual([paused]);
  });

  it('filtra por texto en el slug, sin importar mayúsculas', () => {
    expect(filterTenants(tenants, 'LUNA', 'all')).toEqual([building]);
  });

  it('filtra por estado', () => {
    expect(filterTenants(tenants, '', 'paused')).toEqual([paused]);
  });

  it('combina texto y estado', () => {
    expect(filterTenants(tenants, 'acme', 'paused')).toEqual([]);
    expect(filterTenants(tenants, 'acme', 'active')).toEqual([active]);
  });

  it('sin coincidencias devuelve una lista vacía', () => {
    expect(filterTenants(tenants, 'no existe', 'all')).toEqual([]);
  });
});
