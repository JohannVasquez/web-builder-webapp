import { renderToStaticMarkup } from 'react-dom/server';
import { Features } from './Features';
import { CallToAction } from './CallToAction';
import { Testimonials } from './Testimonials';

describe('Features variants', () => {
  const baseProps = {
    title: 'Nuestros servicios',
    items: [
      { title: 'Uno', description: 'Desc uno', icon: 'zap' },
      { title: 'Dos', description: 'Desc dos' },
      { title: 'Tres', description: 'Desc tres' },
    ],
  };

  it('sin variant se ve igual que la variante card explícita', () => {
    const withoutVariant = renderToStaticMarkup(<Features sectionProps={baseProps} />);
    const withCard = renderToStaticMarkup(
      <Features sectionProps={{ ...baseProps, variant: 'card' }} />,
    );
    expect(withoutVariant).toBe(withCard);
  });

  it('card envuelve cada item en ui-card', () => {
    const html = renderToStaticMarkup(
      <Features sectionProps={{ ...baseProps, variant: 'card' }} />,
    );
    expect(html).toContain('data-variant="card"');
    expect(html).toContain('ui-card p-8');
  });

  it('plain no envuelve los items en ui-card', () => {
    const html = renderToStaticMarkup(
      <Features sectionProps={{ ...baseProps, variant: 'plain' }} />,
    );
    expect(html).toContain('data-variant="plain"');
    expect(html).not.toContain('ui-card p-8');
  });

  it('list ordena los items en una columna con el ícono a la izquierda', () => {
    const html = renderToStaticMarkup(
      <Features sectionProps={{ ...baseProps, variant: 'list' }} />,
    );
    expect(html).toContain('data-variant="list"');
    expect(html).toContain('items-start gap-4 text-left');
  });

  it('bento hace que el primer item ocupe dos columnas', () => {
    const html = renderToStaticMarkup(
      <Features sectionProps={{ ...baseProps, variant: 'bento' }} />,
    );
    expect(html).toContain('data-variant="bento"');
    expect(html).toContain('sm:col-span-2');
  });

  it('una variante desconocida cae a card', () => {
    const unknown = renderToStaticMarkup(
      <Features sectionProps={{ ...baseProps, variant: 'unknown-layout' }} />,
    );
    const card = renderToStaticMarkup(
      <Features sectionProps={{ ...baseProps, variant: 'card' }} />,
    );
    expect(unknown).toBe(card);
  });

  it.each(['card', 'plain', 'list', 'bento'] as const)(
    'la variante %s muestra todos los items',
    (variant) => {
      const html = renderToStaticMarkup(
        <Features sectionProps={{ ...baseProps, variant }} />,
      );
      expect(html).toContain('Uno');
      expect(html).toContain('Desc uno');
      expect(html).toContain('Dos');
      expect(html).toContain('Desc dos');
      expect(html).toContain('Tres');
      expect(html).toContain('Desc tres');
    },
  );
});

describe('CallToAction variants', () => {
  const baseProps = {
    title: 'Empecemos hoy',
    subtitle: 'Hablemos de tu proyecto',
    buttonLabel: 'Contactar',
    buttonHref: '/contacto',
  };

  it('sin variant se ve igual que la variante banner explícita', () => {
    const withoutVariant = renderToStaticMarkup(
      <CallToAction sectionProps={baseProps} />,
    );
    const withBanner = renderToStaticMarkup(
      <CallToAction sectionProps={{ ...baseProps, variant: 'banner' }} />,
    );
    expect(withoutVariant).toBe(withBanner);
  });

  it('banner ocupa una banda con bg-primary', () => {
    const html = renderToStaticMarkup(
      <CallToAction sectionProps={{ ...baseProps, variant: 'banner' }} />,
    );
    expect(html).toContain('data-variant="banner"');
    expect(html).toContain('bg-primary');
  });

  it('card envuelve el contenido en una ui-card centrada', () => {
    const html = renderToStaticMarkup(
      <CallToAction sectionProps={{ ...baseProps, variant: 'card' }} />,
    );
    expect(html).toContain('data-variant="card"');
    expect(html).toContain('ui-card flex w-full flex-col items-center');
  });

  it('split acomoda el texto y el botón en fila a partir de md', () => {
    const html = renderToStaticMarkup(
      <CallToAction sectionProps={{ ...baseProps, variant: 'split' }} />,
    );
    expect(html).toContain('data-variant="split"');
    expect(html).toContain('md:flex-row');
  });

  it('una variante desconocida cae a banner', () => {
    const unknown = renderToStaticMarkup(
      <CallToAction sectionProps={{ ...baseProps, variant: 'unknown-layout' }} />,
    );
    const banner = renderToStaticMarkup(
      <CallToAction sectionProps={{ ...baseProps, variant: 'banner' }} />,
    );
    expect(unknown).toBe(banner);
  });

  it.each(['banner', 'card', 'split'] as const)(
    'la variante %s conserva título, subtítulo y botón',
    (variant) => {
      const html = renderToStaticMarkup(
        <CallToAction sectionProps={{ ...baseProps, variant }} />,
      );
      expect(html).toContain('Empecemos hoy');
      expect(html).toContain('Hablemos de tu proyecto');
      expect(html).toContain('Contactar');
    },
  );
});

describe('Testimonials variants', () => {
  const baseProps = {
    title: 'Lo que dicen',
    items: [
      { quote: 'Excelente servicio', authorName: 'Ana', rating: 5 },
      { quote: 'Muy recomendable', authorName: 'Luis', rating: 4 },
      { quote: 'Justo lo que necesitaba', authorName: 'Marta', rating: 5 },
    ],
  };

  it('sin variant se ve igual que la variante carousel explícita', () => {
    const withoutVariant = renderToStaticMarkup(
      <Testimonials sectionProps={baseProps} />,
    );
    const withCarousel = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'carousel' }} />,
    );
    expect(withoutVariant).toBe(withCarousel);
  });

  it('carousel muestra un testimonio con flechas de navegación', () => {
    const html = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'carousel' }} />,
    );
    expect(html).toContain('data-variant="carousel"');
    expect(html).toContain('aria-label="Testimonio anterior"');
  });

  it('grid muestra todos los testimonios en una grilla', () => {
    const html = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'grid' }} />,
    );
    expect(html).toContain('data-variant="grid"');
    expect(html).toContain('sm:grid-cols-2');
  });

  it('featured destaca solo el primer testimonio en grande', () => {
    const html = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'featured' }} />,
    );
    expect(html).toContain('data-variant="featured"');
    expect(html).toContain('text-2xl');
  });

  it('masonry arma un muro de columnas con break-inside-avoid', () => {
    const html = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'masonry' }} />,
    );
    expect(html).toContain('data-variant="masonry"');
    expect(html).toContain('columns-1');
    expect(html).toContain('break-inside-avoid');
  });

  it('una variante desconocida cae a carousel', () => {
    const unknown = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'unknown-layout' }} />,
    );
    const carousel = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'carousel' }} />,
    );
    expect(unknown).toBe(carousel);
  });

  it('grid y masonry no pierden ningún testimonio', () => {
    for (const variant of ['grid', 'masonry'] as const) {
      const html = renderToStaticMarkup(
        <Testimonials sectionProps={{ ...baseProps, variant }} />,
      );
      expect(html).toContain('Excelente servicio');
      expect(html).toContain('Muy recomendable');
      expect(html).toContain('Justo lo que necesitaba');
    }
  });

  it('carousel conserva acceso a todos los testimonios vía los puntos de navegación', () => {
    const html = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'carousel' }} />,
    );
    expect(html).toContain('aria-label="Ir al testimonio 1"');
    expect(html).toContain('aria-label="Ir al testimonio 2"');
    expect(html).toContain('aria-label="Ir al testimonio 3"');
  });

  it('featured muestra el título de la sección y el primer testimonio', () => {
    const html = renderToStaticMarkup(
      <Testimonials sectionProps={{ ...baseProps, variant: 'featured' }} />,
    );
    expect(html).toContain('Lo que dicen');
    expect(html).toContain('Excelente servicio');
  });
});
