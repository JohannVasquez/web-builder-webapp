import { renderToStaticMarkup } from 'react-dom/server';
import { SellerIdentityCard } from './SellerIdentityCard';
import type { SellerIdentity } from '../domain/StoreSettings';

const COMPLETE: SellerIdentity = {
  legalName: 'Pastelería Acme SpA',
  taxId: '76086428-5',
  address: 'Av. Siempre Viva 742, Santiago',
  email: 'hola@acme.cl',
  phone: '+56912345678',
};

describe('SellerIdentityCard', () => {
  it('muestra quién vende, con razón social y RUT', () => {
    const html = renderToStaticMarkup(<SellerIdentityCard seller={COMPLETE} />);

    expect(html).toContain('Pastelería Acme SpA');
    expect(html).toContain('RUT 76086428-5');
    expect(html).toContain('Av. Siempre Viva 742, Santiago');
  });

  it('lleva nombre accesible, para que un lector de pantalla lo anuncie', () => {
    expect(renderToStaticMarkup(<SellerIdentityCard seller={COMPLETE} />)).toContain(
      'aria-label="Datos del vendedor"',
    );
  });

  it('con datos a medias muestra lo que hay, sin huecos etiquetados', () => {
    const html = renderToStaticMarkup(
      <SellerIdentityCard seller={{ ...COMPLETE, phone: null, email: '' }} />,
    );

    expect(html).toContain('Pastelería Acme SpA');
    expect(html).not.toContain('Teléfono');
  });

  it('sin datos no se pinta nada: la validación de tienda incompleta vive en la API', () => {
    expect(renderToStaticMarkup(<SellerIdentityCard seller={undefined} />)).toBe('');
  });

  it('una tienda vieja, con todos los campos nulos, tampoco pinta un bloque vacío', () => {
    const vacio: SellerIdentity = {
      legalName: null,
      taxId: null,
      address: null,
      email: null,
      phone: null,
    };

    expect(renderToStaticMarkup(<SellerIdentityCard seller={vacio} />)).toBe('');
  });
});
