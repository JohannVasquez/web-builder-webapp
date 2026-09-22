import { renderToStaticMarkup } from 'react-dom/server';
import { SectionRenderer } from './SectionRenderer';
import type { PageSection } from '../domain/Page';

const section = (
  type: string,
  position: number,
  props: Record<string, unknown>,
): PageSection => ({ type, position, props, anchor: null });

// Spec 6.3: la jerarquía de encabezados la decide la posición en la página, no cada bloque
// por su cuenta. Un solo `h1`, y ningún bloque salta de `h2` a `h4`.
describe('SectionRenderer: jerarquía de encabezados de una página con varios bloques', () => {
  it('el primer bloque es el único h1 de la página; el resto son h2', () => {
    const html = renderToStaticMarkup(
      <SectionRenderer
        sections={[
          section('Hero', 0, { title: 'Electricidad residencial e industrial' }),
          section('Faq', 1, {
            title: 'Preguntas frecuentes',
            items: [{ question: '¿Hacen despachos?', answer: 'Sí.' }],
          }),
          section('Newsletter', 2, { title: 'Novedades' }),
        ]}
      />,
    );
    const h1Count = html.match(/<h1[ >]/g)?.length ?? 0;
    expect(h1Count).toBe(1);
    expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('<h2'));
  });

  it('un bloque con subtítulos que NO es el primero, pasa sus items a h3 (h2 -> h3, sin salto)', () => {
    const html = renderToStaticMarkup(
      <SectionRenderer
        sections={[
          section('Hero', 0, { title: 'Portada' }),
          section('Features', 1, {
            title: 'Nuestros servicios',
            items: [{ title: 'Instalaciones', description: 'Cableado y tableros.' }],
          }),
        ]}
      />,
    );
    expect(html).toContain('<h1');
    expect(html).toContain('<h2');
    expect(html).toContain('<h3');
    expect(html).not.toContain('<h4');
  });

  it('un bloque con subtítulos que SÍ es el primero, pasa sus items a h2 (h1 -> h2, sin saltar a h3)', () => {
    const html = renderToStaticMarkup(
      <SectionRenderer
        sections={[
          section('Features', 0, {
            title: 'Nuestros servicios',
            items: [{ title: 'Instalaciones', description: 'Cableado y tableros.' }],
          }),
        ]}
      />,
    );
    expect(html).toContain('<h1');
    expect(html).toContain('<h2');
    expect(html).not.toContain('<h3');
  });
});
