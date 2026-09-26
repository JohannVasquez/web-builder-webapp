/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TenantDetail } from './TenantDetail';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import type { Tenant } from '../domain/AdminApi';

jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));
jest.mock('./TenantDomains', () => ({ TenantDomains: () => <p>Dominios</p> }));
jest.mock('./TenantSubscriptionDetail', () => ({
  TenantSubscriptionDetail: () => <p>Mensualidad</p>,
}));
jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn(),
  refreshAsyncData: jest.fn(),
  revalidateAsyncData: jest.fn(),
}));

const demoTenant: Tenant = {
  id: 't-demo',
  slug: 'demo-pasteleria-luna',
  name: 'Pastelería Luna',
  primaryDomain: 'demo-pasteleria-luna.webbuilder.cl',
  status: 'demo',
};

const activeTenant: Tenant = {
  id: 't-active',
  slug: 'taller-andes',
  name: 'Taller Andes',
  primaryDomain: 'taller-andes.webbuilder.cl',
  status: 'active',
};

describe('TenantDetail', () => {
  const api = { get: jest.fn().mockResolvedValue({ tenants: [] }) };

  beforeEach(() => {
    (useAdminApi as jest.Mock).mockReturnValue(api);
    (useAsyncData as jest.Mock).mockImplementation(
      (key: string, load: () => Promise<unknown>) => {
        void load();
        return {
          data: key.endsWith(':pages') ? [] : [demoTenant, activeTenant],
          error: null,
          isLoading: false,
        };
      },
    );
  });

  it('encuentra el sitio de una demo ("Editar sitio" llega aquí) pidiendo también las demos', () => {
    render(<TenantDetail tenantId="t-demo" />);

    expect(screen.getByRole('heading', { name: 'Pastelería Luna' })).toBeInTheDocument();
    expect(useAsyncData).toHaveBeenCalledWith(
      'admin:tenants:with-demos',
      expect.any(Function),
    );
    expect(api.get).toHaveBeenCalledWith(
      '/api/admin/tenants?includeDemos=true',
      expect.anything(),
    );
  });

  it('en una demo cambia pausar, dominios y cobro por el camino de vuelta a Demos', () => {
    render(<TenantDetail tenantId="t-demo" />);

    expect(screen.getByText('Demo de prospecto')).toBeInTheDocument();
    expect(screen.getByText('Este sitio es una demo de prospecto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir a Demos/ })).toHaveAttribute(
      'href',
      '/demos',
    );
    expect(screen.queryByRole('button', { name: /Pausar/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Dominios')).not.toBeInTheDocument();
    expect(screen.queryByText('Mensualidad')).not.toBeInTheDocument();
    // Sin el enlace mágico la dirección de la demo es un 404: no se ofrece abrirla.
    expect(
      screen.queryByText('demo-pasteleria-luna.webbuilder.cl'),
    ).not.toBeInTheDocument();
  });

  it('un cliente normal conserva sus secciones', () => {
    render(<TenantDetail tenantId="t-active" />);

    expect(screen.getByRole('button', { name: /Pausar/ })).toBeInTheDocument();
    expect(screen.getByText('Dominios')).toBeInTheDocument();
    expect(screen.getByText('Mensualidad')).toBeInTheDocument();
    expect(
      screen.queryByText('Este sitio es una demo de prospecto'),
    ).not.toBeInTheDocument();
  });
});
