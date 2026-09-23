import { buildBrandPatch, findLowContrastPairs, normalizeHexInput } from './brandForm';
import { DEFAULT_BRAND, type Brand } from '@/modules/Brand/domain/Brand';

describe('normalizeHexInput', () => {
  it('acepta un hex de 6 dígitos sin cambios, en minúsculas', () => {
    expect(normalizeHexInput('#1D4ED8')).toBe('#1d4ed8');
  });

  it('agrega el `#` si falta', () => {
    expect(normalizeHexInput('1d4ed8')).toBe('#1d4ed8');
  });

  it('expande un hex de 3 dígitos', () => {
    expect(normalizeHexInput('ABC')).toBe('#aabbcc');
  });

  it('ignora espacios alrededor', () => {
    expect(normalizeHexInput('  #fff  ')).toBe('#ffffff');
  });

  it('rechaza algo que no es un hex válido', () => {
    expect(normalizeHexInput('red')).toBeNull();
    expect(normalizeHexInput('#12345')).toBeNull();
    expect(normalizeHexInput('')).toBeNull();
  });
});

describe('findLowContrastPairs', () => {
  it('detecta un texto que no llega a 4.5:1 sobre el fondo', () => {
    const pairs = findLowContrastPairs({ background: '#ffffff', foreground: '#eeeeee' });
    expect(pairs.map((pair) => pair.key)).toContain('foreground');
  });

  it('no marca nada cuando todos los pares cumplen', () => {
    const pairs = findLowContrastPairs({ background: '#ffffff', foreground: '#111111' });
    expect(pairs).toEqual([]);
  });

  it('sin fondo definido no puede evaluar nada', () => {
    expect(findLowContrastPairs({ foreground: '#eeeeee' })).toEqual([]);
  });

  it('revisa también los colores de estado', () => {
    const pairs = findLowContrastPairs({
      background: '#ffffff',
      success: '#e5ffe5',
    });
    expect(pairs.map((pair) => pair.key)).toContain('success');
  });
});

describe('buildBrandPatch', () => {
  const original: Brand = DEFAULT_BRAND;

  it('no manda nada si no hay cambios', () => {
    expect(buildBrandPatch(original, original)).toEqual({});
  });

  it('manda solo `colorMode` cuando es lo único que cambió', () => {
    const draft: Brand = { ...original, colorMode: 'dark' };
    expect(buildBrandPatch(original, draft)).toEqual({ colorMode: 'dark' });
  });

  it('manda la paleta completa cuando cambió un solo color', () => {
    const draft: Brand = {
      ...original,
      palette: { ...original.palette, primary: '#0f766e' },
    };
    expect(buildBrandPatch(original, draft)).toEqual({
      palette: { ...original.palette, primary: '#0f766e' },
    });
  });

  it('manda tipografía completa (pairing + scale) cuando cambió solo la escala', () => {
    const draft: Brand = {
      ...original,
      typography: { ...original.typography, scale: 'spacious' },
    };
    expect(buildBrandPatch(original, draft)).toEqual({
      typography: { pairing: original.typography.pairing, scale: 'spacious' },
    });
  });

  it('manda varias secciones a la vez si cambiaron varias', () => {
    const draft: Brand = {
      ...original,
      colorMode: 'dark',
      visualStyle: 'minimal',
    };
    expect(buildBrandPatch(original, draft)).toEqual({
      colorMode: 'dark',
      visualStyle: 'minimal',
    });
  });
});
