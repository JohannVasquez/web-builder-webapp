import { renderToStaticMarkup } from 'react-dom/server';
import { SiteJsonLd } from './SiteJsonLd';
import { DEFAULT_GLOBAL_SETTINGS, type GlobalSettings } from '../domain/GlobalSettings';

const SITE_URL = 'https://acme.cl';

const settingsWith = (overrides: Partial<GlobalSettings>): GlobalSettings => ({
  ...DEFAULT_GLOBAL_SETTINGS,
  siteName: 'Pastelería Acme',
  ...overrides,
});

const graphOf = (
  settings: GlobalSettings,
  hasStore = false,
): Record<string, unknown>[] => {
  const html = renderToStaticMarkup(
    <SiteJsonLd settings={settings} siteUrl={SITE_URL} hasStore={hasStore} />,
  );
  const json = html.replace(/^.*?>/, '').replace(/<\/script>$/, '');
  return (JSON.parse(json) as { '@graph': Record<string, unknown>[] })['@graph'];
};

const nodeOfType = (
  graph: Record<string, unknown>[],
  type: string,
): Record<string, unknown> | undefined => graph.find((node) => node['@type'] === type);

describe('SiteJsonLd', () => {
  it('con dirección o teléfono el negocio se declara LocalBusiness, no Organization a secas', () => {
    const graph = graphOf(settingsWith({ address: 'Av. Siempre Viva 742' }));

    expect(nodeOfType(graph, 'LocalBusiness')).toBeDefined();
    // Emitir los dos crearía dos entidades para el mismo negocio.
    expect(nodeOfType(graph, 'Organization')).toBeUndefined();
  });

  it('sin dirección ni teléfono sigue habiendo organización, con el tipo genérico', () => {
    const graph = graphOf(settingsWith({}));

    expect(nodeOfType(graph, 'Organization')).toBeDefined();
    expect(nodeOfType(graph, 'LocalBusiness')).toBeUndefined();
  });

  it('el sitio referencia a la organización por @id en vez de repetirla', () => {
    const graph = graphOf(settingsWith({ contactPhone: '+56 9 1234 5678' }));
    const website = nodeOfType(graph, 'WebSite');

    expect(website?.publisher).toEqual({ '@id': 'https://acme.cl/#organization' });
    expect(nodeOfType(graph, 'LocalBusiness')?.['@id']).toBe(
      'https://acme.cl/#organization',
    );
  });

  it('con tienda encendida ofrece el buscador de sitio', () => {
    const graph = graphOf(settingsWith({}), true);
    const action = nodeOfType(graph, 'WebSite')?.potentialAction as
      { target: { urlTemplate: string } } | undefined;

    expect(action?.target.urlTemplate).toBe(
      'https://acme.cl/tienda?q={search_term_string}',
    );
  });

  it('sin tienda no ofrece un buscador que no existe', () => {
    const graph = graphOf(settingsWith({}), false);

    expect(nodeOfType(graph, 'WebSite')?.potentialAction).toBeUndefined();
  });

  it('lista solo los perfiles sociales configurados', () => {
    const graph = graphOf(
      settingsWith({
        instagramUrl: 'https://instagram.com/acme',
        facebookUrl: '',
      }),
    );

    expect(nodeOfType(graph, 'Organization')?.sameAs).toEqual([
      'https://instagram.com/acme',
    ]);
  });
});
