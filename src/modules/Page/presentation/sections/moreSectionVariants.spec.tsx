import { renderToStaticMarkup as render } from 'react-dom/server';
import type { ReactElement } from 'react';
import { ConsentProvider } from '@/modules/Consent/presentation/ConsentProvider';

// El pie y el formulario de contacto llevan controles de consentimiento (reconfigurar
// cookies, autorizar el tratamiento de datos), así que necesitan su contexto.
const renderToStaticMarkup = (element: ReactElement): string =>
  render(<ConsentProvider>{element}</ConsentProvider>);
import { Stats } from './Stats';
import { ServiceCards } from './ServiceCards';
import { ContactFormSection } from './ContactFormSection';

describe('Stats variants', () => {
  const items = [
    { value: '+1.200', label: 'Clientes' },
    { value: '24/7', label: 'Soporte' },
    { value: '98%', label: 'Satisfacción' },
  ];

  it('sin variant, el HTML es idéntico al de "row" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Stats sectionProps={{ items }} />);
    const withRow = renderToStaticMarkup(
      <Stats sectionProps={{ items, variant: 'row' }} />,
    );

    expect(withoutVariant).toEqual(withRow);
  });

  it('una variante desconocida cae a "row"', () => {
    const withUnknown = renderToStaticMarkup(
      <Stats sectionProps={{ items, variant: 'bogus' }} />,
    );
    const withRow = renderToStaticMarkup(
      <Stats sectionProps={{ items, variant: 'row' }} />,
    );

    expect(withUnknown).toEqual(withRow);
  });

  it('cada variante produce un marcado distinguible', () => {
    const row = renderToStaticMarkup(<Stats sectionProps={{ items, variant: 'row' }} />);
    const cards = renderToStaticMarkup(
      <Stats sectionProps={{ items, variant: 'cards' }} />,
    );
    const counter = renderToStaticMarkup(
      <Stats sectionProps={{ items, variant: 'counter' }} />,
    );

    expect(row).toContain('data-variant="row"');
    expect(cards).toContain('data-variant="cards"');
    expect(counter).toContain('data-variant="counter"');
    expect(cards).toContain('ui-card');
    expect(row).not.toContain('ui-card');
  });

  it('el contenido aparece en todas las variantes', () => {
    for (const variant of ['row', 'cards', 'counter']) {
      const html = renderToStaticMarkup(<Stats sectionProps={{ items, variant }} />);
      expect(html).toContain('Clientes');
      expect(html).toContain('Soporte');
      expect(html).toContain('Satisfacción');
    }
  });

  it('en "counter" renderiza el valor final en el HTML del servidor, sin quedar en 0', () => {
    const html = renderToStaticMarkup(
      <Stats sectionProps={{ items, variant: 'counter' }} />,
    );

    expect(html).toContain('+1.200');
    expect(html).toContain('24/7');
    expect(html).toContain('98%');
    expect(html).not.toContain('>0<');
  });

  it('en "counter", una cifra sin dígitos se muestra tal cual sin animar', () => {
    const html = renderToStaticMarkup(
      <Stats
        sectionProps={{
          items: [{ value: 'Excelente', label: 'Rating' }],
          variant: 'counter',
        }}
      />,
    );

    expect(html).toContain('Excelente');
  });
});

describe('ServiceCards variants', () => {
  const items = [
    {
      title: 'Instalación',
      description: 'Servicio de instalación completo.',
      checklist: ['Paso uno', 'Paso dos'],
    },
    {
      title: 'Mantención',
      description: 'Revisión periódica de equipos.',
      checklist: [],
    },
  ];

  it('sin variant, el HTML es idéntico al de "grid" explícito', () => {
    const withoutVariant = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items }} />,
    );
    const withGrid = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items, variant: 'grid' }} />,
    );

    expect(withoutVariant).toEqual(withGrid);
  });

  it('una variante desconocida cae a "grid"', () => {
    const withUnknown = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items, variant: 'bogus' }} />,
    );
    const withGrid = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items, variant: 'grid' }} />,
    );

    expect(withUnknown).toEqual(withGrid);
  });

  it('cada variante produce un marcado distinguible', () => {
    const grid = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items, variant: 'grid' }} />,
    );
    const carousel = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items, variant: 'carousel' }} />,
    );
    const accordion = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items, variant: 'accordion' }} />,
    );

    expect(grid).toContain('data-variant="grid"');
    expect(carousel).toContain('data-variant="carousel"');
    expect(accordion).toContain('data-variant="accordion"');
    expect(carousel).toContain('snap-mandatory');
    expect(accordion).toContain('<details');
    expect(grid).not.toContain('<details');
    expect(grid).not.toContain('snap-mandatory');
  });

  it('el contenido aparece en todas las variantes', () => {
    for (const variant of ['grid', 'carousel', 'accordion']) {
      const html = renderToStaticMarkup(
        <ServiceCards sectionProps={{ items, variant }} />,
      );
      expect(html).toContain('Instalación');
      expect(html).toContain('Servicio de instalación completo.');
      expect(html).toContain('Mantención');
    }
  });

  it('"accordion" usa <details>/<summary> nativos', () => {
    const html = renderToStaticMarkup(
      <ServiceCards sectionProps={{ items, variant: 'accordion' }} />,
    );

    expect(html).toContain('<details');
    expect(html).toContain('<summary');
  });
});

describe('ContactFormSection variants', () => {
  const channels = [
    { type: 'phone' as const, title: 'Llámanos', value: '+56 9 1234 5678' },
  ];

  it('sin variant, el HTML es idéntico al de "channels" explícito', () => {
    const withoutVariant = renderToStaticMarkup(
      <ContactFormSection sectionProps={{ title: 'Contáctanos', channels }} />,
    );
    const withChannels = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{ title: 'Contáctanos', channels, variant: 'channels' }}
      />,
    );

    expect(withoutVariant).toEqual(withChannels);
  });

  it('una variante desconocida cae a "channels"', () => {
    const withUnknown = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{ title: 'Contáctanos', channels, variant: 'bogus' }}
      />,
    );
    const withChannels = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{ title: 'Contáctanos', channels, variant: 'channels' }}
      />,
    );

    expect(withUnknown).toEqual(withChannels);
  });

  it('cada variante produce un marcado distinguible', () => {
    const withChannels = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{ title: 'Contáctanos', channels, variant: 'channels' }}
      />,
    );
    const form = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{ title: 'Contáctanos', channels, variant: 'form' }}
      />,
    );
    const map = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{
          title: 'Contáctanos',
          variant: 'map',
          address: 'Av. Siempre Viva 123',
        }}
      />,
    );

    expect(withChannels).toContain('data-variant="channels"');
    expect(form).toContain('data-variant="form"');
    expect(map).toContain('data-variant="map"');
    expect(map).toContain('<iframe');
    expect(form).not.toContain('<iframe');
    expect(withChannels).toContain('Llámanos');
    expect(form).not.toContain('Llámanos');
  });

  it('el contenido aparece en todas las variantes', () => {
    for (const variant of ['channels', 'form', 'map']) {
      const html = renderToStaticMarkup(
        <ContactFormSection
          sectionProps={{
            title: 'Contáctanos',
            subtitle: 'Estamos para ayudarte',
            variant,
            address: 'Av. Siempre Viva 123',
          }}
        />,
      );
      expect(html).toContain('Contáctanos');
      expect(html).toContain('Estamos para ayudarte');
    }
  });

  it('"map" sin address ni lat/lng cae a "channels"', () => {
    const mapWithoutProps = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{ title: 'Contáctanos', channels, variant: 'map' }}
      />,
    );
    const explicitChannels = renderToStaticMarkup(
      <ContactFormSection
        sectionProps={{ title: 'Contáctanos', channels, variant: 'channels' }}
      />,
    );

    expect(mapWithoutProps).toEqual(explicitChannels);
    expect(mapWithoutProps).not.toContain('<iframe');
  });
});
