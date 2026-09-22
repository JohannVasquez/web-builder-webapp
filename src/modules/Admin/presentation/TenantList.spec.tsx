import { renderToStaticMarkup } from 'react-dom/server';
import { TenantCards } from './TenantList';
import type { Tenant } from '../domain/AdminApi';

const active: Tenant = {
  id: '018f6f1a-0000-7000-8000-000000000001',
  slug: 'acme',
  name: 'Acme',
  primaryDomain: 'acme.cl',
  status: 'active',
};

const paused: Tenant = {
  id: '018f6f1a-0000-7000-8000-000000000002',
  slug: 'electrica',
  name: 'Eléctrica del Sur',
  primaryDomain: null,
  status: 'paused',
};

const building: Tenant = {
  id: '018f6f1a-0000-7000-8000-000000000003',
  slug: 'pasteleria-luna',
  name: 'Pastelería Luna',
  primaryDomain: null,
  status: 'building',
};

describe('TenantCards', () => {
  it('sin clientes muestra el mensaje de lista vacía', () => {
    const html = renderToStaticMarkup(<TenantCards tenants={[]} />);
    expect(html).toContain('No hay clientes que coincidan con la búsqueda.');
  });

  it('un cliente activo con dominio muestra la insignia y el enlace al sitio', () => {
    const html = renderToStaticMarkup(<TenantCards tenants={[active]} />);
    expect(html).toContain('Acme');
    expect(html).toContain('Activo');
    expect(html).toContain('http://acme.cl');
    expect(html).toContain('Ver sitio');
  });

  it('un cliente pausado sin dominio no ofrece enlace al sitio', () => {
    const html = renderToStaticMarkup(<TenantCards tenants={[paused]} />);
    expect(html).toContain('Pausado');
    expect(html).not.toContain('Ver sitio');
  });

  it('un cliente en construcción muestra esa etiqueta', () => {
    const html = renderToStaticMarkup(<TenantCards tenants={[building]} />);
    expect(html).toContain('En construcción');
  });
});
