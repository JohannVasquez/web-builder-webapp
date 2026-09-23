import { renderToStaticMarkup } from 'react-dom/server';
import { Hero } from './Hero';

describe('Hero: prioridad de la imagen sobre el pliegue (Spec 6.2)', () => {
  const props = {
    variant: 'split' as const,
    title: 'Electricistas certificados',
    imageUrl: 'https://bucket.example.com/hero.jpg',
  };

  it('siendo el primer bloque de la página, carga la imagen sin esperar y con prioridad alta', () => {
    const html = renderToStaticMarkup(<Hero sectionProps={props} headingLevel={1} />);
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('loading="eager"');
    expect(html).toContain('decoding="async"');
  });

  it('si no es el primer bloque, la imagen se difiere como cualquier otra bajo el pliegue', () => {
    const html = renderToStaticMarkup(<Hero sectionProps={props} headingLevel={2} />);
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('fetchPriority="high"');
  });

  it('sin headingLevel explícito, se asume que es el título principal de la página', () => {
    const html = renderToStaticMarkup(<Hero sectionProps={props} />);
    expect(html).toContain('<h1');
  });
});

describe('Hero: la variante `centered` pide precarga porque su fondo es CSS, no <img> (Spec 6.2)', () => {
  const props = {
    title: 'Electricistas certificados',
    imageUrl: 'https://bucket.example.com/portada.jpg',
  };

  it('siendo el primer bloque, precarga la imagen de fondo', () => {
    const html = renderToStaticMarkup(<Hero sectionProps={props} headingLevel={1} />);
    expect(html).toContain('<link rel="preload"');
    expect(html).toContain('as="image"');
    expect(html).toContain('fetchPriority="high"');
  });

  it('si no es el primer bloque, no compite por la prioridad del verdadero hero', () => {
    const html = renderToStaticMarkup(<Hero sectionProps={props} headingLevel={2} />);
    expect(html).not.toContain('<link rel="preload"');
  });
});

describe('Hero: jerarquía de encabezado según la posición (Spec 6.3)', () => {
  const props = { title: 'Electricidad residencial e industrial' };

  it('como primer bloque de la página, es el h1', () => {
    const html = renderToStaticMarkup(<Hero sectionProps={props} headingLevel={1} />);
    expect(html).toContain('<h1');
    expect(html).not.toContain('<h2');
  });

  it('si otro bloque ya es el h1, pasa a h2', () => {
    const html = renderToStaticMarkup(<Hero sectionProps={props} headingLevel={2} />);
    expect(html).toContain('<h2');
    expect(html).not.toContain('<h1');
  });
});

describe('Hero: el carrusel anuncia cuál imagen está activa', () => {
  it('el punto de la imagen activa lleva aria-current', () => {
    const html = renderToStaticMarkup(
      <Hero
        sectionProps={{
          title: 'Electricidad residencial e industrial',
          images: ['https://bucket.example.com/a.jpg', 'https://bucket.example.com/b.jpg'],
        }}
      />,
    );
    expect(html).toContain('aria-current="true"');
  });
});
