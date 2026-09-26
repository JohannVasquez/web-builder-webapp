import { renderToStaticMarkup } from 'react-dom/server';
import { BlogContent } from './BlogContent';
import type { BlogContentBlock } from '../domain/BlogPost';

describe('BlogContent', () => {
  it('dibuja un párrafo', () => {
    const html = renderToStaticMarkup(
      <BlogContent blocks={[{ type: 'paragraph', text: 'Hola mundo' }]} />,
    );
    expect(html).toContain('<p');
    expect(html).toContain('Hola mundo');
  });

  it('dibuja un encabezado de nivel 2 como h2 y de nivel 3 como h3', () => {
    const html2 = renderToStaticMarkup(
      <BlogContent blocks={[{ type: 'heading', level: 2, text: 'Título' }]} />,
    );
    expect(html2).toContain('<h2');
    expect(html2).toContain('Título');

    const html3 = renderToStaticMarkup(
      <BlogContent blocks={[{ type: 'heading', level: 3, text: 'Subtítulo' }]} />,
    );
    expect(html3).toContain('<h3');
    expect(html3).toContain('Subtítulo');
  });

  it('dibuja una lista ordenada como ol y una lista simple como ul', () => {
    const ordered = renderToStaticMarkup(
      <BlogContent blocks={[{ type: 'list', ordered: true, items: ['Uno', 'Dos'] }]} />,
    );
    expect(ordered).toContain('<ol');
    expect(ordered).toContain('Uno');
    expect(ordered).toContain('Dos');

    const unordered = renderToStaticMarkup(
      <BlogContent blocks={[{ type: 'list', ordered: false, items: ['Uno'] }]} />,
    );
    expect(unordered).toContain('<ul');
  });

  it('dibuja una cita con su atribución', () => {
    const html = renderToStaticMarkup(
      <BlogContent
        blocks={[{ type: 'quote', text: 'Una frase memorable', cite: 'Alguien' }]}
      />,
    );
    expect(html).toContain('<blockquote');
    expect(html).toContain('Una frase memorable');
    expect(html).toContain('Alguien');
  });

  it('dibuja una imagen con su alt y su descripción', () => {
    const html = renderToStaticMarkup(
      <BlogContent
        blocks={[
          {
            type: 'image',
            key: 'https://bucket.test/foto.jpg',
            alt: 'Una foto',
            caption: 'Pie de foto',
          },
        ]}
      />,
    );
    expect(html).toMatch(/https%3A%2F%2Fbucket.test%2Ffoto.jpg/);
    expect(html).toContain('alt="Una foto"');
    expect(html).toContain('Pie de foto');
  });

  it('dibuja un video de YouTube como iframe', () => {
    const html = renderToStaticMarkup(
      <BlogContent
        blocks={[
          {
            type: 'video',
            url: 'https://www.youtube.com/watch?v=abc123def45',
            caption: 'Video',
          },
        ]}
      />,
    );
    expect(html).toContain('<iframe');
    expect(html).toContain('youtube.com/embed/abc123def45');
  });

  it('dibuja un divisor', () => {
    const html = renderToStaticMarkup(<BlogContent blocks={[{ type: 'divider' }]} />);
    expect(html).toContain('<hr');
  });

  it('ignora en silencio un tipo de bloque desconocido, sin lanzar', () => {
    const unknownBlock = {
      type: 'carousel',
      items: [1, 2, 3],
    } as unknown as BlogContentBlock;
    expect(() =>
      renderToStaticMarkup(<BlogContent blocks={[unknownBlock]} />),
    ).not.toThrow();
    const html = renderToStaticMarkup(<BlogContent blocks={[unknownBlock]} />);
    expect(html).not.toContain('carousel');
  });

  it('una lista de bloques vacía no rompe', () => {
    expect(() => renderToStaticMarkup(<BlogContent blocks={[]} />)).not.toThrow();
  });
});
