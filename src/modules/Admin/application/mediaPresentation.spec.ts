import {
  buildMediaSearchQuery,
  formatMediaSize,
  isMissingAlt,
} from './mediaPresentation';

describe('formatMediaSize', () => {
  it('muestra bytes crudos por debajo de 1 KB', () => {
    expect(formatMediaSize(0)).toBe('0 B');
    expect(formatMediaSize(500)).toBe('500 B');
  });

  it('muestra KB redondeados entre 1 KB y 1 MB', () => {
    expect(formatMediaSize(1024)).toBe('1 KB');
    expect(formatMediaSize(1536)).toBe('2 KB');
  });

  it('muestra MB con dos decimales a partir de 1 MB', () => {
    expect(formatMediaSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatMediaSize(2_500_000)).toBe('2.38 MB');
  });
});

describe('isMissingAlt', () => {
  it('trata `null` como sin texto alternativo', () => {
    expect(isMissingAlt(null)).toBe(true);
  });

  it('trata una cadena vacía o solo espacios como sin texto alternativo', () => {
    expect(isMissingAlt('')).toBe(true);
    expect(isMissingAlt('   ')).toBe(true);
  });

  it('acepta un texto alternativo real', () => {
    expect(isMissingAlt('Fachada de la tienda')).toBe(false);
  });
});

describe('buildMediaSearchQuery', () => {
  it('no manda `search` cuando está vacío', () => {
    expect(buildMediaSearchQuery('')).toBe('');
    expect(buildMediaSearchQuery('   ')).toBe('');
  });

  it('codifica el término de búsqueda', () => {
    expect(buildMediaSearchQuery('logo tienda')).toBe('?search=logo%20tienda');
  });

  it('recorta espacios en los extremos', () => {
    expect(buildMediaSearchQuery('  logo  ')).toBe('?search=logo');
  });
});
