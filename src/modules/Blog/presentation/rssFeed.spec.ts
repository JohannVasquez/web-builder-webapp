import { buildBlogRssXml, escapeXml } from './rssFeed';
import type { BlogPostSummary } from '../domain/BlogPost';

const post = (overrides: Partial<BlogPostSummary> = {}): BlogPostSummary => ({
  slug: 'post-publicado',
  title: 'Publicación',
  excerpt: 'Resumen',
  coverImageUrl: null,
  authorName: 'Autor',
  publishedAt: '2026-01-05T10:00:00.000Z',
  tags: [],
  readingMinutes: 3,
  ...overrides,
});

describe('escapeXml', () => {
  it('escapa &, < y >', () => {
    expect(escapeXml('Antes & Después < 100% > 50%')).toBe(
      'Antes &amp; Después &lt; 100% &gt; 50%',
    );
  });

  it('no altera texto sin caracteres especiales', () => {
    expect(escapeXml('Texto normal')).toBe('Texto normal');
  });
});

describe('buildBlogRssXml', () => {
  const channel = {
    siteName: 'ElectroAndes',
    siteUrl: 'https://electrica.cl',
    description: 'Novedades de ElectroAndes',
  };

  it('arma un canal RSS 2.0 válido con una entrada por publicación', () => {
    const xml = buildBlogRssXml(channel, [post()]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('<link>https://electrica.cl/blog/post-publicado</link>');
  });

  it('escapa un "&" en el título para no romper el canal entero', () => {
    const xml = buildBlogRssXml(channel, [post({ title: 'Tableros & certificaciones' })]);

    expect(xml).toContain('<title>Tableros &amp; certificaciones</title>');
    // Un "&" crudo en el XML es inválido: solo debe aparecer como parte de "&amp;", "&lt;" o "&gt;".
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;)/);
  });

  it('escapa < y > en el resumen', () => {
    const xml = buildBlogRssXml(channel, [post({ excerpt: 'Voltaje < 220V y > 110V' })]);

    expect(xml).toContain('<description>Voltaje &lt; 220V y &gt; 110V</description>');
  });

  it('sin publicaciones deja el canal sin items pero sigue siendo XML válido', () => {
    const xml = buildBlogRssXml(channel, []);

    expect(xml).not.toContain('<item>');
    expect(xml).toContain('</channel>');
  });
});
