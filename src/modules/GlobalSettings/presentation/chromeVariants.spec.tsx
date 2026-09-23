import { renderToStaticMarkup as render } from 'react-dom/server';
import type { ReactElement } from 'react';
import { ConsentProvider } from '@/modules/Consent/presentation/ConsentProvider';

// El pie y el formulario de contacto llevan controles de consentimiento (reconfigurar
// cookies, autorizar el tratamiento de datos), así que necesitan su contexto.
const renderToStaticMarkup = (element: ReactElement): string =>
  render(<ConsentProvider>{element}</ConsentProvider>);
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DEFAULT_GLOBAL_SETTINGS, type GlobalSettings } from '../domain/GlobalSettings';

const baseSettings: GlobalSettings = {
  ...DEFAULT_GLOBAL_SETTINGS,
  siteName: 'Acme Co.',
};

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Contacto', href: '/contacto' },
];

describe('Navbar variants', () => {
  it('sin variant, el HTML es idéntico al de "classic" explícito', () => {
    const withoutVariant = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} />,
    );
    const withClassic = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="classic" />,
    );

    expect(withoutVariant).toEqual(withClassic);
  });

  it('una variante desconocida cae a "classic"', () => {
    const withUnknown = renderToStaticMarkup(
      // @ts-expect-error -- probamos el fallback en runtime ante un valor fuera del union
      <Navbar settings={baseSettings} links={links} variant="bogus" />,
    );
    const withClassic = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="classic" />,
    );

    expect(withUnknown).toEqual(withClassic);
  });

  it('cada variante produce un marcado distinguible', () => {
    const classic = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="classic" />,
    );
    const centered = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="centered" />,
    );
    const transparent = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="transparent" />,
    );

    expect(classic).toContain('data-variant="classic"');
    expect(centered).toContain('data-variant="centered"');
    expect(transparent).toContain('data-variant="transparent"');
    expect(classic).not.toEqual(centered);
    expect(classic).not.toEqual(transparent);
  });

  it('el contenido (nombre del sitio y enlaces) aparece en todas las variantes', () => {
    for (const variant of ['classic', 'centered', 'transparent'] as const) {
      const html = renderToStaticMarkup(
        <Navbar settings={baseSettings} links={links} variant={variant} />,
      );
      expect(html).toContain('Acme Co.');
      expect(html).toContain('Servicios');
      expect(html).toContain('Contacto');
    }
  });

  it('"transparent" no trae fondo antes de hacer scroll (sin la clase ui-nav en el header)', () => {
    const html = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="transparent" />,
    );
    const headerTag = html.slice(0, html.indexOf('>') + 1);

    expect(headerTag).not.toContain('ui-nav');
  });

  it('"classic" y "centered" siempre traen la clase ui-nav', () => {
    const classic = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="classic" />,
    );
    const centered = renderToStaticMarkup(
      <Navbar settings={baseSettings} links={links} variant="centered" />,
    );

    expect(classic.slice(0, classic.indexOf('>') + 1)).toContain('ui-nav');
    expect(centered.slice(0, centered.indexOf('>') + 1)).toContain('ui-nav');
  });
});

describe('Footer variants', () => {
  it('sin variant, el HTML es idéntico al de "columns" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Footer settings={baseSettings} />);
    const withColumns = renderToStaticMarkup(
      <Footer settings={baseSettings} variant="columns" />,
    );

    expect(withoutVariant).toEqual(withColumns);
  });

  it('una variante desconocida cae a "columns"', () => {
    const withUnknown = renderToStaticMarkup(
      // @ts-expect-error -- probamos el fallback en runtime ante un valor fuera del union
      <Footer settings={baseSettings} variant="bogus" />,
    );
    const withColumns = renderToStaticMarkup(
      <Footer settings={baseSettings} variant="columns" />,
    );

    expect(withUnknown).toEqual(withColumns);
  });

  it('cada variante produce un marcado distinguible', () => {
    const simple = renderToStaticMarkup(
      <Footer settings={baseSettings} variant="simple" />,
    );
    const columns = renderToStaticMarkup(
      <Footer settings={baseSettings} variant="columns" />,
    );
    const newsletter = renderToStaticMarkup(
      <Footer settings={baseSettings} variant="newsletter" />,
    );

    expect(simple).toContain('data-variant="simple"');
    expect(columns).toContain('data-variant="columns"');
    expect(newsletter).toContain('data-variant="newsletter"');
    expect(newsletter).toContain('Novedades');
    expect(columns).not.toContain('Novedades');
    expect(simple).not.toContain('Novedades');
  });

  it('el contenido (nombre del sitio y copyright) aparece en todas las variantes', () => {
    const year = new Date().getFullYear();
    for (const variant of ['simple', 'columns', 'newsletter'] as const) {
      const html = renderToStaticMarkup(
        <Footer settings={baseSettings} variant={variant} />,
      );
      expect(html).toContain('Acme Co.');
      expect(html).toContain(`© ${year} Acme Co.`);
    }
  });

  it('"newsletter" sin onSubscribe muestra el mensaje de activación en vez de un formulario', () => {
    const html = renderToStaticMarkup(
      <Footer settings={baseSettings} variant="newsletter" />,
    );

    expect(html).toContain('La suscripción se activa junto con el bloque de novedades.');
    expect(html).not.toContain('<form');
  });

  it('"newsletter" con onSubscribe sí muestra el formulario de suscripción', () => {
    const html = renderToStaticMarkup(
      <Footer settings={baseSettings} variant="newsletter" onSubscribe={() => {}} />,
    );

    expect(html).toContain('<form');
    expect(html).toContain('Suscribirme');
  });
});
