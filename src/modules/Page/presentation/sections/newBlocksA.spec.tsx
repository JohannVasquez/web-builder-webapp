import { renderToStaticMarkup } from 'react-dom/server';
import { Faq } from './Faq';
import { Pricing } from './Pricing';
import { Gallery } from './Gallery';
import { LogoCloud } from './LogoCloud';

describe('Faq', () => {
  const items = [
    {
      question: '¿Hacen despachos a regiones?',
      answer: 'Sí, cubrimos todo Chile continental.',
    },
    {
      question: '¿Cuánto dura la garantía?',
      answer: 'Doce meses por defecto de fábrica.',
    },
  ];

  it('sin items no renderiza nada', () => {
    expect(renderToStaticMarkup(<Faq sectionProps={{ title: 'Preguntas' }} />)).toEqual(
      '',
    );
  });

  it('con datos, las preguntas y respuestas aparecen', () => {
    const html = renderToStaticMarkup(
      <Faq sectionProps={{ title: 'Preguntas', items }} />,
    );
    expect(html).toContain('¿Hacen despachos a regiones?');
    expect(html).toContain('Doce meses por defecto de fábrica.');
  });

  it('las respuestas quedan en el HTML del servidor sin depender de JS (no variant)', () => {
    const html = renderToStaticMarkup(<Faq sectionProps={{ items }} />);
    expect(html).toContain('Sí, cubrimos todo Chile continental.');
    expect(html).toContain('Doce meses por defecto de fábrica.');
  });

  it('sin variant, el HTML es idéntico al de "accordion" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Faq sectionProps={{ items }} />);
    const withAccordion = renderToStaticMarkup(
      <Faq sectionProps={{ items, variant: 'accordion' }} />,
    );
    expect(withoutVariant).toEqual(withAccordion);
  });

  it('una variante desconocida cae a "accordion"', () => {
    const withUnknown = renderToStaticMarkup(
      <Faq sectionProps={{ items, variant: 'bogus' }} />,
    );
    const withAccordion = renderToStaticMarkup(
      <Faq sectionProps={{ items, variant: 'accordion' }} />,
    );
    expect(withUnknown).toEqual(withAccordion);
  });

  it('cada variante produce un marcado distinguible', () => {
    const accordion = renderToStaticMarkup(
      <Faq sectionProps={{ items, variant: 'accordion' }} />,
    );
    const list = renderToStaticMarkup(<Faq sectionProps={{ items, variant: 'list' }} />);
    expect(accordion).toContain('data-variant="accordion"');
    expect(list).toContain('data-variant="list"');
    expect(list).toContain('open=""');
    expect(accordion).not.toContain('open=""');
  });

  it('emite datos estructurados FAQPage con las preguntas', () => {
    const html = renderToStaticMarkup(<Faq sectionProps={{ items }} />);
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"¿Hacen despachos a regiones?"');
  });
});

describe('Pricing', () => {
  const plans = [
    {
      name: 'Básico',
      priceMonthly: 9990,
      features: ['1 sitio', 'Soporte por email'],
      ctaLabel: 'Elegir',
      ctaHref: '/checkout/basico',
    },
    {
      name: 'Pro',
      priceMonthly: 19990,
      priceYearly: 199900,
      features: ['5 sitios', 'Soporte prioritario'],
      ctaLabel: 'Elegir',
      ctaHref: '/checkout/pro',
      featured: true,
    },
  ];

  const formatCLP = (amount: number): string =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);

  it('sin plans no renderiza nada', () => {
    expect(renderToStaticMarkup(<Pricing sectionProps={{ title: 'Planes' }} />)).toEqual(
      '',
    );
  });

  it('con datos, los planes aparecen', () => {
    const html = renderToStaticMarkup(<Pricing sectionProps={{ plans }} />);
    expect(html).toContain('Básico');
    expect(html).toContain('Pro');
    expect(html).toContain('1 sitio');
  });

  it('el precio sale formateado en pesos chilenos', () => {
    const html = renderToStaticMarkup(<Pricing sectionProps={{ plans }} />);
    expect(html).toContain(formatCLP(9990));
    expect(html).toContain(formatCLP(19990));
  });

  it('el plan destacado se distingue visualmente', () => {
    const html = renderToStaticMarkup(<Pricing sectionProps={{ plans }} />);
    expect(html).toContain('Más popular');
    expect((html.match(/Más popular/g) ?? []).length).toBe(1);
    expect(html).toContain('ring-primary');
  });

  it('un plan sin priceYearly no rompe', () => {
    const html = renderToStaticMarkup(
      <Pricing sectionProps={{ plans, showBillingToggle: true }} />,
    );
    expect(html).toContain('Básico');
    expect(html).toContain(formatCLP(9990));
  });

  it('sin variant, el HTML es idéntico al de "cards" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Pricing sectionProps={{ plans }} />);
    const withCards = renderToStaticMarkup(
      <Pricing sectionProps={{ plans, variant: 'cards' }} />,
    );
    expect(withoutVariant).toEqual(withCards);
  });

  it('una variante desconocida cae a "cards"', () => {
    const withUnknown = renderToStaticMarkup(
      <Pricing sectionProps={{ plans, variant: 'bogus' }} />,
    );
    const withCards = renderToStaticMarkup(
      <Pricing sectionProps={{ plans, variant: 'cards' }} />,
    );
    expect(withUnknown).toEqual(withCards);
  });

  it('cada variante produce un marcado distinguible', () => {
    const cards = renderToStaticMarkup(
      <Pricing sectionProps={{ plans, variant: 'cards' }} />,
    );
    const table = renderToStaticMarkup(
      <Pricing sectionProps={{ plans, variant: 'table' }} />,
    );
    expect(cards).toContain('data-variant="cards"');
    expect(table).toContain('data-variant="table"');
    expect(table).toContain('<table');
    expect(cards).not.toContain('<table');
  });
});

describe('Gallery', () => {
  const images = [
    { url: 'https://bucket.test/uno.jpg', alt: 'Fachada del local' },
    {
      url: 'https://bucket.test/dos.jpg',
      alt: 'Interior de la tienda',
      caption: 'Sala principal',
    },
  ];

  it('sin images no renderiza nada', () => {
    expect(renderToStaticMarkup(<Gallery sectionProps={{ title: 'Galería' }} />)).toEqual(
      '',
    );
  });

  it('con datos, las imágenes aparecen con su alt', () => {
    const html = renderToStaticMarkup(<Gallery sectionProps={{ images }} />);
    expect(html).toContain('alt="Fachada del local"');
    expect(html).toContain('alt="Interior de la tienda"');
  });

  it('incluye un <dialog> para la vista ampliada', () => {
    const html = renderToStaticMarkup(<Gallery sectionProps={{ images }} />);
    expect(html).toContain('<dialog');
  });

  it('sin variant, el HTML es idéntico al de "grid" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Gallery sectionProps={{ images }} />);
    const withGrid = renderToStaticMarkup(
      <Gallery sectionProps={{ images, variant: 'grid' }} />,
    );
    expect(withoutVariant).toEqual(withGrid);
  });

  it('una variante desconocida cae a "grid"', () => {
    const withUnknown = renderToStaticMarkup(
      <Gallery sectionProps={{ images, variant: 'bogus' }} />,
    );
    const withGrid = renderToStaticMarkup(
      <Gallery sectionProps={{ images, variant: 'grid' }} />,
    );
    expect(withUnknown).toEqual(withGrid);
  });

  it('cada variante produce un marcado distinguible', () => {
    const grid = renderToStaticMarkup(
      <Gallery sectionProps={{ images, variant: 'grid' }} />,
    );
    const masonry = renderToStaticMarkup(
      <Gallery sectionProps={{ images, variant: 'masonry' }} />,
    );
    expect(grid).toContain('data-variant="grid"');
    expect(masonry).toContain('data-variant="masonry"');
    expect(masonry).toContain('columns-2');
    expect(grid).not.toContain('columns-2');
  });
});

describe('LogoCloud', () => {
  const logos = [
    { url: 'https://bucket.test/logo-a.svg', alt: 'Marca A' },
    {
      url: 'https://bucket.test/logo-b.svg',
      alt: 'Marca B',
      href: 'https://marca-b.test',
    },
  ];

  it('sin logos no renderiza nada', () => {
    expect(
      renderToStaticMarkup(<LogoCloud sectionProps={{ title: 'Confían en nosotros' }} />),
    ).toEqual('');
  });

  it('con datos, los logos aparecen', () => {
    const html = renderToStaticMarkup(<LogoCloud sectionProps={{ logos }} />);
    expect(html).toContain('alt="Marca A"');
    expect(html).toContain('alt="Marca B"');
  });

  it('un logo con href sale envuelto en un enlace seguro; sin href, no', () => {
    const html = renderToStaticMarkup(
      <LogoCloud sectionProps={{ logos, variant: 'row' }} />,
    );
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
    expect((html.match(/<a /g) ?? []).length).toBe(1);
  });

  it('sin variant, el HTML es idéntico al de "row" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<LogoCloud sectionProps={{ logos }} />);
    const withRow = renderToStaticMarkup(
      <LogoCloud sectionProps={{ logos, variant: 'row' }} />,
    );
    expect(withoutVariant).toEqual(withRow);
  });

  it('una variante desconocida cae a "row"', () => {
    const withUnknown = renderToStaticMarkup(
      <LogoCloud sectionProps={{ logos, variant: 'bogus' }} />,
    );
    const withRow = renderToStaticMarkup(
      <LogoCloud sectionProps={{ logos, variant: 'row' }} />,
    );
    expect(withUnknown).toEqual(withRow);
  });

  it('cada variante produce un marcado distinguible', () => {
    const row = renderToStaticMarkup(
      <LogoCloud sectionProps={{ logos, variant: 'row' }} />,
    );
    const marquee = renderToStaticMarkup(
      <LogoCloud sectionProps={{ logos, variant: 'marquee' }} />,
    );
    expect(row).toContain('data-variant="row"');
    expect(marquee).toContain('data-variant="marquee"');
    expect(marquee).toContain('logocloud-marquee');
    expect(row).not.toContain('logocloud-marquee');
  });

  it('la cinta "marquee" se detiene bajo prefers-reduced-motion (es una animation CSS, no JS)', () => {
    const html = renderToStaticMarkup(
      <LogoCloud sectionProps={{ logos, variant: 'marquee' }} />,
    );
    expect(html).toContain('animation:logocloud-marquee');
  });
});
