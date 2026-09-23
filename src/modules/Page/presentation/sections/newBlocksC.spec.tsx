import { renderToStaticMarkup } from 'react-dom/server';
import { BeforeAfter } from './BeforeAfter';
import { OpeningHours } from './OpeningHours';
import { Newsletter } from './Newsletter';
import { GoogleReviews } from './GoogleReviews';

describe('BeforeAfter variants', () => {
  const base = {
    title: 'Antes de nuestro servicio',
    beforeUrl: 'https://bucket.test/before.jpg',
    afterUrl: 'https://bucket.test/after.jpg',
    beforeLabel: 'Sin pintar',
    afterLabel: 'Pintado',
    caption: 'Fachada residencial, 2024',
  };

  it('sin beforeUrl/afterUrl no se renderiza', () => {
    const html = renderToStaticMarkup(
      <BeforeAfter sectionProps={{ title: 'Antes y después' }} />,
    );
    expect(html).toEqual('');
  });

  it('con datos, el contenido aparece', () => {
    const html = renderToStaticMarkup(<BeforeAfter sectionProps={base} />);
    expect(html).toContain('Antes de nuestro servicio');
    expect(html).toContain('Fachada residencial, 2024');
    expect(html).toContain('Sin pintar');
    expect(html).toContain('Pintado');
  });

  it('sin variant, el HTML es idéntico al de "slider" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<BeforeAfter sectionProps={base} />);
    const withSlider = renderToStaticMarkup(
      <BeforeAfter sectionProps={{ ...base, variant: 'slider' }} />,
    );
    expect(withoutVariant).toEqual(withSlider);
  });

  it('una variante desconocida cae a "slider"', () => {
    const withUnknown = renderToStaticMarkup(
      <BeforeAfter sectionProps={{ ...base, variant: 'bogus' }} />,
    );
    const withSlider = renderToStaticMarkup(
      <BeforeAfter sectionProps={{ ...base, variant: 'slider' }} />,
    );
    expect(withUnknown).toEqual(withSlider);
  });

  it('cada variante produce un marcado distinguible', () => {
    const slider = renderToStaticMarkup(
      <BeforeAfter sectionProps={{ ...base, variant: 'slider' }} />,
    );
    const sideBySide = renderToStaticMarkup(
      <BeforeAfter sectionProps={{ ...base, variant: 'sideBySide' }} />,
    );
    expect(slider).toContain('data-variant="slider"');
    expect(sideBySide).toContain('data-variant="sideBySide"');
    expect(slider).toContain('type="range"');
    expect(sideBySide).not.toContain('type="range"');
  });

  it('el deslizador es un <input type="range"> con aria-label que explica qué controla', () => {
    const html = renderToStaticMarkup(<BeforeAfter sectionProps={base} />);
    const match = /<input[^>]*type="range"[^>]*>/.exec(html);
    expect(match).not.toBeNull();
    const rangeTag = match?.[0] ?? '';
    expect(rangeTag).toContain('aria-label=');
    expect(rangeTag).toContain('Sin pintar');
    expect(rangeTag).toContain('Pintado');
  });
});

describe('OpeningHours component', () => {
  const days = [
    { day: 'lunes' as const, open: '09:00', close: '18:00' },
    { day: 'martes' as const, open: '09:00', close: '18:00' },
  ];

  it('sin days no se renderiza', () => {
    const html = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios' }} />,
    );
    expect(html).toEqual('');
  });

  it('con datos, los horarios aparecen en el HTML del servidor', () => {
    const html = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios de atención', days }} />,
    );
    expect(html).toContain('Horarios de atención');
    expect(html).toContain('Lunes');
    expect(html).toContain('9:00–18:00');
    expect(html).not.toContain('Abierto ahora');
    expect(html).not.toContain('Cerrado ahora');
  });

  it('sin variant, el HTML es idéntico al de "list" explícito', () => {
    const withoutVariant = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios', days }} />,
    );
    const withList = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios', days, variant: 'list' }} />,
    );
    expect(withoutVariant).toEqual(withList);
  });

  it('una variante desconocida cae a "list"', () => {
    const withUnknown = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios', days, variant: 'bogus' }} />,
    );
    const withList = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios', days, variant: 'list' }} />,
    );
    expect(withUnknown).toEqual(withList);
  });

  it('cada variante produce un marcado distinguible', () => {
    const list = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios', days, variant: 'list' }} />,
    );
    const compact = renderToStaticMarkup(
      <OpeningHours sectionProps={{ title: 'Horarios', days, variant: 'compact' }} />,
    );
    expect(list).toContain('data-variant="list"');
    expect(compact).toContain('data-variant="compact"');
    expect(compact).toContain('Lunes a martes');
  });
});

describe('Newsletter variants', () => {
  const base = {
    title: 'Recibe nuestras novedades',
    subtitle: 'Sin spam, lo prometemos.',
  };

  it('sin título no se renderiza', () => {
    const html = renderToStaticMarkup(<Newsletter sectionProps={{}} />);
    expect(html).toEqual('');
  });

  it('con datos, el contenido aparece', () => {
    const html = renderToStaticMarkup(<Newsletter sectionProps={base} />);
    expect(html).toContain('Recibe nuestras novedades');
    expect(html).toContain('Sin spam, lo prometemos.');
    expect(html).toContain('Suscribirme');
  });

  it('trae el campo trampa oculto para bots', () => {
    const html = renderToStaticMarkup(<Newsletter sectionProps={base} />);
    expect(html).toContain('id="newsletter-website"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('sin variant, el HTML es idéntico al de "inline" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<Newsletter sectionProps={base} />);
    const withInline = renderToStaticMarkup(
      <Newsletter sectionProps={{ ...base, variant: 'inline' }} />,
    );
    expect(withoutVariant).toEqual(withInline);
  });

  it('una variante desconocida cae a "inline"', () => {
    const withUnknown = renderToStaticMarkup(
      <Newsletter sectionProps={{ ...base, variant: 'bogus' }} />,
    );
    const withInline = renderToStaticMarkup(
      <Newsletter sectionProps={{ ...base, variant: 'inline' }} />,
    );
    expect(withUnknown).toEqual(withInline);
  });

  it('cada variante produce un marcado distinguible', () => {
    const inline = renderToStaticMarkup(
      <Newsletter sectionProps={{ ...base, variant: 'inline' }} />,
    );
    const card = renderToStaticMarkup(
      <Newsletter sectionProps={{ ...base, variant: 'card' }} />,
    );
    expect(inline).toContain('data-variant="inline"');
    expect(card).toContain('data-variant="card"');
    expect(card).toContain('ui-card');
    expect(inline).not.toContain('ui-card');
  });
});

describe('GoogleReviews variants', () => {
  const reviews = [
    { author: 'Marcela Soto', rating: 5, text: 'Excelente atención y rapidez.' },
    { author: 'Pedro Ruiz', rating: 4, text: 'Muy buen trabajo, volveria a contratar.' },
  ];
  const base = {
    title: 'Lo que dicen nuestros clientes',
    rating: 4.8,
    reviewCount: 128,
    profileUrl: 'https://www.google.com/maps/place/negocio',
    reviews,
  };

  it('sin reviews no se renderiza', () => {
    const html = renderToStaticMarkup(
      <GoogleReviews sectionProps={{ title: 'Reseñas', rating: 5, reviewCount: 10 }} />,
    );
    expect(html).toEqual('');
  });

  it('con datos, el contenido aparece', () => {
    const html = renderToStaticMarkup(<GoogleReviews sectionProps={base} />);
    expect(html).toContain('Lo que dicen nuestros clientes');
    expect(html).toContain('Marcela Soto');
    expect(html).toContain('Excelente atención y rapidez.');
  });

  it('formatea la calificación con coma decimal (es-CL)', () => {
    const html = renderToStaticMarkup(<GoogleReviews sectionProps={base} />);
    expect(html).toContain('4,8');
    expect(html).not.toContain('4.8');
  });

  it('con profileUrl, agrega el enlace "Ver todas en Google" seguro', () => {
    const html = renderToStaticMarkup(<GoogleReviews sectionProps={base} />);
    expect(html).toContain('Ver todas en Google');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('sin variant, el HTML es idéntico al de "summary" explícito', () => {
    const withoutVariant = renderToStaticMarkup(<GoogleReviews sectionProps={base} />);
    const withSummary = renderToStaticMarkup(
      <GoogleReviews sectionProps={{ ...base, variant: 'summary' }} />,
    );
    expect(withoutVariant).toEqual(withSummary);
  });

  it('una variante desconocida cae a "summary"', () => {
    const withUnknown = renderToStaticMarkup(
      <GoogleReviews sectionProps={{ ...base, variant: 'bogus' }} />,
    );
    const withSummary = renderToStaticMarkup(
      <GoogleReviews sectionProps={{ ...base, variant: 'summary' }} />,
    );
    expect(withUnknown).toEqual(withSummary);
  });

  it('cada variante produce un marcado distinguible', () => {
    const summary = renderToStaticMarkup(
      <GoogleReviews sectionProps={{ ...base, variant: 'summary' }} />,
    );
    const cards = renderToStaticMarkup(
      <GoogleReviews sectionProps={{ ...base, variant: 'cards' }} />,
    );
    expect(summary).toContain('data-variant="summary"');
    expect(cards).toContain('data-variant="cards"');
    expect(summary).toContain('text-5xl');
    expect(cards).not.toContain('text-5xl');
  });
});
