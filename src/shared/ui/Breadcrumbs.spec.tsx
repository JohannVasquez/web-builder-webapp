import { renderToStaticMarkup } from 'react-dom/server';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';

const SITE_URL = 'https://acme.cl';

const render = (crumbs: readonly Crumb[]): string =>
  renderToStaticMarkup(<Breadcrumbs crumbs={crumbs} siteUrl={SITE_URL} />);

const jsonLdOf = (html: string): Record<string, unknown> => {
  const match = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html);
  if (match === null) {
    throw new Error('no hay dato estructurado en el marcado');
  }
  return JSON.parse(match[1]) as Record<string, unknown>;
};

const PRODUCTO: Crumb[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Torta de chocolate' },
];

describe('Breadcrumbs', () => {
  it('con una sola miga no dibuja nada: "Inicio" a secas no orienta a nadie', () => {
    expect(render([{ label: 'Inicio', href: '/' }])).toBe('');
  });

  it('el dato estructurado repite las migas visibles, en orden y con URL absoluta', () => {
    const data = jsonLdOf(render(PRODUCTO));

    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://acme.cl/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tienda',
        item: 'https://acme.cl/tienda',
      },
      // La página actual no se enlaza a sí misma.
      { '@type': 'ListItem', position: 3, name: 'Torta de chocolate' },
    ]);
  });

  it('la última miga se anuncia como la página actual y no es un enlace', () => {
    const html = render(PRODUCTO);

    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('href="/tienda/torta-chocolate"');
  });

  it('la navegación lleva nombre accesible', () => {
    expect(render(PRODUCTO)).toContain('aria-label="Ruta de navegación"');
  });
});
