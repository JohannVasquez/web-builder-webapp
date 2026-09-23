import { renderToStaticMarkup } from 'react-dom/server';
import { BlogPostingJsonLd } from './BlogPostingJsonLd';
import type { BlogPostDetail } from '../domain/BlogPost';

const SITE_URL = 'https://acme.cl';

const POST: BlogPostDetail = {
  slug: 'elegir-torta',
  title: 'Cómo elegir una torta',
  excerpt: 'Guía breve para no equivocarse',
  coverImageUrl: 'https://bucket.example.com/portada.jpg',
  authorName: 'Ana Pérez',
  publishedAt: '2026-01-15T10:00:00.000Z',
  tags: ['tortas', 'guías'],
  readingMinutes: 4,
  content: [],
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  related: [],
};

interface PostingData {
  readonly author: unknown;
  readonly dateModified: string;
  readonly mainEntityOfPage: unknown;
  readonly publisher: { readonly '@id': string; readonly logo?: unknown };
  readonly articleSection?: string;
}

const dataOf = (post: BlogPostDetail, logoUrl: string | null = null): PostingData => {
  const html = renderToStaticMarkup(
    <BlogPostingJsonLd
      post={post}
      siteUrl={SITE_URL}
      siteName="Pastelería Acme"
      logoUrl={logoUrl}
    />,
  );
  const json = html.replace(/^.*?>/, '').replace(/<\/script>$/, '');
  return JSON.parse(json) as PostingData;
};

describe('BlogPostingJsonLd', () => {
  it('declara el autor como persona', () => {
    expect(dataOf(POST).author).toEqual({ '@type': 'Person', name: 'Ana Pérez' });
  });

  it('una publicación corregida declara su fecha de modificación', () => {
    const corregido = { ...POST, updatedAt: '2026-03-01T09:00:00.000Z' };

    expect(dataOf(corregido).dateModified).toBe('2026-03-01T09:00:00.000Z');
  });

  it('sin fecha de modificación cae a la de publicación en vez de omitirla', () => {
    expect(dataOf(POST).dateModified).toBe('2026-01-15T10:00:00.000Z');
  });

  it('el artículo se ata a su propia URL', () => {
    expect(dataOf(POST).mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://acme.cl/blog/elegir-torta',
    });
  });

  it('la editorial referencia a la organización del sitio y lleva su logo', () => {
    const publisher = dataOf(POST, 'https://acme.cl/brand-asset/logo-light').publisher;

    expect(publisher['@id']).toBe('https://acme.cl/#organization');
    expect(publisher.logo).toEqual({
      '@type': 'ImageObject',
      url: 'https://acme.cl/brand-asset/logo-light',
    });
  });

  it('la primera etiqueta hace de sección del artículo', () => {
    expect(dataOf(POST).articleSection).toBe('tortas');
  });

  it('sin etiquetas no inventa una sección', () => {
    expect(dataOf({ ...POST, tags: [] }).articleSection).toBeUndefined();
  });
});
