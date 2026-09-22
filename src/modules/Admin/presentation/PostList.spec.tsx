import { renderToStaticMarkup } from 'react-dom/server';
import { PostList } from './BlogManager';
import type { BlogPost } from '../domain/BlogApi';

describe('PostList', () => {
  const basePost: BlogPost = {
    id: 1,
    slug: 'test',
    title: 'Test',
    excerpt: 'Test excerpt',
    coverImageKey: null,
    content: [],
    authorName: 'Autor',
    status: 'draft',
    publishedAt: null,
    tags: [],
    seoTitle: null,
    seoDescription: null,
    ogImageKey: null,
    createdAt: '2026-09-16T19:00:00Z',
    updatedAt: '2026-09-16T19:00:00Z',
  };

  it('muestra mensaje si está vacía', () => {
    const html = renderToStaticMarkup(
      <PostList
        posts={[]}
        tenantId="1"
        pendingActionId={null}
        onDelete={() => {}}
      />,
    );
    expect(html).toContain('Todavía no hay publicaciones.');
  });

  it('muestra un borrador', () => {
    const html = renderToStaticMarkup(
      <PostList
        posts={[{ ...basePost, id: 1, title: 'Mi Borrador', status: 'draft' }]}
        tenantId="1"
        pendingActionId={null}
        onDelete={() => {}}
      />,
    );
    expect(html).toContain('Mi Borrador');
    expect(html).toContain('Borrador');
    expect(html).toContain('Sin fecha');
  });

  it('muestra una publicada', () => {
    const html = renderToStaticMarkup(
      <PostList
        posts={[
          {
            ...basePost,
            id: 2,
            title: 'Mi Publicación',
            status: 'published',
            publishedAt: '2026-09-16T19:00:00Z',
          },
        ]}
        tenantId="1"
        pendingActionId={null}
        onDelete={() => {}}
      />,
    );
    expect(html).toContain('Mi Publicación');
    expect(html).toContain('Publicada');
    // no validamos la fecha exacta por la zona horaria en la que corran los tests
  });

  it('muestra una programada', () => {
    const html = renderToStaticMarkup(
      <PostList
        posts={[
          {
            ...basePost,
            id: 3,
            title: 'Mi Programada',
            status: 'scheduled',
            publishedAt: '2030-01-01T19:00:00Z', // fecha futura segura
          },
        ]}
        tenantId="1"
        pendingActionId={null}
        onDelete={() => {}}
      />,
    );
    expect(html).toContain('Mi Programada');
    expect(html).toContain('Programada');
  });
});
