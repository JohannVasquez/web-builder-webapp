import { headingTag, subHeadingTag } from './heading';

describe('heading', () => {
  it('mapea cada nivel a su etiqueta HTML', () => {
    expect(headingTag(1)).toBe('h1');
    expect(headingTag(2)).toBe('h2');
    expect(headingTag(3)).toBe('h3');
  });

  it('recorta niveles fuera de rango en vez de producir una etiqueta inválida', () => {
    expect(headingTag(0)).toBe('h1');
    expect(headingTag(9)).toBe('h6');
  });

  it('el subtítulo siempre queda un nivel más profundo que el título del bloque', () => {
    expect(subHeadingTag(1)).toBe('h2');
    expect(subHeadingTag(2)).toBe('h3');
  });

  it('el subtítulo nunca pasa de h6, aunque el bloque ya esté al fondo', () => {
    expect(subHeadingTag(6)).toBe('h6');
  });
});
