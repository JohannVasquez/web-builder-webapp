import {
  canonical,
  canonicalPaged,
  NO_INDEX,
  pagedTitle,
  parsePageParam,
  robotsFor,
} from './seo';

describe('canonical', () => {
  it('declara la ruta tal cual, relativa al dominio principal del tenant', () => {
    expect(canonical('/blog/mi-post')).toEqual({ canonical: '/blog/mi-post' });
  });
});

describe('canonicalPaged', () => {
  it('la primera página es la ruta limpia, sin parámetro', () => {
    expect(canonicalPaged('/blog', 1)).toEqual({ canonical: '/blog' });
  });

  it('desde la segunda, el número de página forma parte del canónico', () => {
    expect(canonicalPaged('/blog', 3)).toEqual({ canonical: '/blog?page=3' });
  });

  it('conserva los filtros que definen el listado', () => {
    expect(canonicalPaged('/tienda', 2, { categoria: 'tortas' })).toEqual({
      canonical: '/tienda?page=2&categoria=tortas',
    });
  });

  it('ignora los filtros vacíos o ausentes', () => {
    expect(canonicalPaged('/tienda', 1, { categoria: '', q: undefined })).toEqual({
      canonical: '/tienda',
    });
  });
});

describe('pagedTitle', () => {
  it('la primera página no lleva número', () => {
    expect(pagedTitle('Blog', 1)).toBe('Blog');
  });

  it('el resto sí, para que dos páginas no compartan rótulo', () => {
    expect(pagedTitle('Blog', 2)).toBe('Blog — página 2');
  });
});

describe('parsePageParam', () => {
  it.each([
    ['2', 2],
    [undefined, 1],
    ['0', 1],
    ['-3', 1],
    ['abc', 1],
    ['1.5', 1],
  ])('%s resuelve a la página %s', (input, expected) => {
    expect(parsePageParam(input)).toBe(expected);
  });
});

describe('robotsFor', () => {
  it('lo marcado como no indexable sale del índice', () => {
    expect(robotsFor(true)).toEqual(NO_INDEX);
  });

  it('lo marcado como indexable no impone nada: hereda del sitio', () => {
    expect(robotsFor(false)).toBeUndefined();
  });

  it('sin el dato tampoco: ausente significa que se indexa, que es el estado normal', () => {
    // La API todavía puede no mandarlo y una respuesta en caché de antes tampoco lo trae.
    expect(robotsFor(undefined)).toBeUndefined();
  });

  it('no indexar implica tampoco seguir sus enlaces', () => {
    expect(NO_INDEX).toEqual({ index: false, follow: false });
  });
});
