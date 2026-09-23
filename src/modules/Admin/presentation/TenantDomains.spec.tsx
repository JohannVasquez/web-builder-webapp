import { renderToStaticMarkup } from 'react-dom/server';
import { DomainList } from './TenantDomains';
import type { TenantDomain } from '../domain/AdminApi';

const unverified: TenantDomain = {
  id: '018f6f1a-0000-7000-8000-000000000001',
  domain: 'nueva-tienda.cl',
  isPrimary: false,
  isVerified: false,
  verifiedAt: null,
  instructions: [
    {
      type: 'TXT',
      host: '_webbuilder.nueva-tienda.cl',
      value: 'token-de-verificacion',
      purpose: 'Demuestra que el dominio es tuyo',
    },
    {
      type: 'A',
      host: 'nueva-tienda.cl',
      value: '203.0.113.10',
      purpose: 'Manda el tráfico del dominio al sitio',
    },
  ],
};

const verifiedSecondary: TenantDomain = {
  id: '018f6f1a-0000-7000-8000-000000000002',
  domain: 'verificado.cl',
  isPrimary: false,
  isVerified: true,
  verifiedAt: '2026-01-01T00:00:00.000Z',
  instructions: [],
};

const primary: TenantDomain = {
  id: '018f6f1a-0000-7000-8000-000000000003',
  domain: 'principal.cl',
  isPrimary: true,
  isVerified: true,
  verifiedAt: '2026-01-01T00:00:00.000Z',
  instructions: [],
};

const noop = (): void => {
  // No hace nada: la prueba solo mira el marcado, no las llamadas a estos callbacks.
};

describe('DomainList', () => {
  it('sin dominios muestra el mensaje de lista vacía', () => {
    const html = renderToStaticMarkup(
      <DomainList
        domains={[]}
        pendingId={null}
        onVerify={noop}
        onSetPrimary={noop}
        onDelete={noop}
      />,
    );
    expect(html).toContain('Este cliente todavía no tiene dominios.');
  });

  it('un dominio sin verificar muestra el botón de verificar y la tabla de DNS', () => {
    const html = renderToStaticMarkup(
      <DomainList
        domains={[unverified]}
        pendingId={null}
        onVerify={noop}
        onSetPrimary={noop}
        onDelete={noop}
      />,
    );
    expect(html).toContain('nueva-tienda.cl');
    expect(html).toContain('Sin verificar');
    expect(html).toContain('Verificar');
    expect(html).toContain('_webbuilder.nueva-tienda.cl');
    expect(html).toContain('token-de-verificacion');
    expect(html).not.toContain('Marcar como principal');
    expect(html).not.toContain('Principal');
  });

  it('un dominio verificado pero no principal ofrece marcarlo como principal', () => {
    const html = renderToStaticMarkup(
      <DomainList
        domains={[verifiedSecondary]}
        pendingId={null}
        onVerify={noop}
        onSetPrimary={noop}
        onDelete={noop}
      />,
    );
    expect(html).toContain('Verificado');
    expect(html).toContain('Marcar como principal');
    expect(html).not.toContain('Verificar');
  });

  it('el dominio principal se marca como tal y no ofrece volver a marcarlo', () => {
    const html = renderToStaticMarkup(
      <DomainList
        domains={[primary]}
        pendingId={null}
        onVerify={noop}
        onSetPrimary={noop}
        onDelete={noop}
      />,
    );
    expect(html).toContain('Principal');
    expect(html).not.toContain('Marcar como principal');
  });
});
