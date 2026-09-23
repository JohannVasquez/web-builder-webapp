import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import type { BlogListResponse } from '@/modules/Blog/domain/BlogPost';
import type { BlogService } from '@/modules/Blog/application/BlogService';
import { LatestPosts } from './LatestPosts';

const listResponse = (total: number): BlogListResponse => ({
  total,
  page: 1,
  perPage: 3,
  posts: Array.from({ length: total }, (_, index) => ({
    slug: `post-${index}`,
    title: `Publicación ${index}`,
    excerpt: 'Un resumen',
    coverImageUrl: null,
    authorName: 'Autor',
    publishedAt: '2026-01-05T10:00:00.000Z',
    tags: [],
    readingMinutes: 4,
  })),
});

const fakeBlogService = (
  response: BlogListResponse,
): { readonly service: BlogService; readonly listPosts: jest.Mock } => {
  const listPosts = jest.fn().mockResolvedValue(response);
  const service = { listPosts, getPost: jest.fn() } as unknown as BlogService;
  return { service, listPosts };
};

const render = async (
  sectionProps: Record<string, unknown>,
  blogService: BlogService | undefined,
): Promise<ReactElement | null> => LatestPosts({ sectionProps, blogService });

describe('LatestPosts', () => {
  it('sin publicaciones no renderiza nada', async () => {
    const { service } = fakeBlogService(listResponse(0));
    const element = await render({ title: 'Blog' }, service);
    expect(element).toBeNull();
  });

  it('sin blogService no renderiza nada (no hay a quién pedirle publicaciones)', async () => {
    const element = await render({ title: 'Blog' }, undefined);
    expect(element).toBeNull();
  });

  it('con publicaciones, aparecen sus títulos', async () => {
    const { service } = fakeBlogService(listResponse(2));
    const element = await render({ title: 'Últimas publicaciones' }, service);
    expect(element).not.toBeNull();
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain('Publicación 0');
    expect(html).toContain('Publicación 1');
    expect(html).toContain('Últimas publicaciones');
  });

  it('cada variante es distinguible por su data-variant', async () => {
    const { service } = fakeBlogService(listResponse(1));
    const grid = await render({ variant: 'grid' }, service);
    const list = await render({ variant: 'list' }, service);

    const gridHtml = renderToStaticMarkup(grid as ReactElement);
    const listHtml = renderToStaticMarkup(list as ReactElement);

    expect(gridHtml).toContain('data-variant="grid"');
    expect(listHtml).toContain('data-variant="list"');
    expect(gridHtml).not.toBe(listHtml);
  });

  it('una variante desconocida cae a la variante grid por defecto', async () => {
    const { service } = fakeBlogService(listResponse(1));
    const unknown = await render({ variant: 'carousel' }, service);
    const grid = await render({ variant: 'grid' }, service);

    expect(renderToStaticMarkup(unknown as ReactElement)).toBe(
      renderToStaticMarkup(grid as ReactElement),
    );
  });

  it('pide al servicio la cantidad y la etiqueta pedidas', async () => {
    const { service, listPosts } = fakeBlogService(listResponse(1));

    await render({ count: 5, tag: 'novedades' }, service);

    expect(listPosts).toHaveBeenCalledWith({ page: 1, perPage: 5, tag: 'novedades' });
  });
});
