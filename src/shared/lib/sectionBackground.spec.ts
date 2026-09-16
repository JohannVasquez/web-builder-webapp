import { contrastRatio, parseHex, WCAG_AA_NORMAL_TEXT } from './color';
import { sectionBackgroundStyle } from './sectionBackground';

describe('sectionBackgroundStyle', () => {
  const tokens = (style: unknown): Record<string, string> =>
    (style ?? {}) as Record<string, string>;

  it('sin fondo propio hereda el tema del sitio', () => {
    expect(sectionBackgroundStyle({})).toBeUndefined();
  });

  it('una imagen de fondo lleva velo para que el texto encima se lea', () => {
    const style = tokens(sectionBackgroundStyle({ backgroundImageUrl: 'http://x/y.png' }));

    expect(style.backgroundImage).toContain('http://x/y.png');
    expect(style.backgroundImage).toContain('var(--brand-overlay)');
  });

  it('la imagen de fondo gana sobre el color de fondo', () => {
    const style = tokens(
      sectionBackgroundStyle({ backgroundColor: '#ff0000', backgroundImageUrl: 'http://x/y.png' }),
    );

    expect(style.backgroundImage).toContain('http://x/y.png');
    expect(style.backgroundColor).toBeUndefined();
  });

  it('una sección con color propio redefine su texto para seguir siendo legible', () => {
    const light = tokens(sectionBackgroundStyle({ backgroundColor: '#eef2ff' }));
    const dark = tokens(sectionBackgroundStyle({ backgroundColor: '#17104c' }));

    expect(light['--foreground']).toBe('#000000');
    expect(dark['--foreground']).toBe('#ffffff');
  });

  it('el texto secundario sobre un fondo propio también cumple AA', () => {
    for (const color of ['#eef2ff', '#17104c', '#fbbf24', '#0f766e', '#f5f5f5']) {
      const style = tokens(sectionBackgroundStyle({ backgroundColor: color }));
      const ratio = contrastRatio(
        parseHex(style['--muted-foreground'] ?? '')!,
        parseHex(color)!,
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    }
  });

  it('un color de fondo inválido no rompe la sección', () => {
    const style = tokens(sectionBackgroundStyle({ backgroundColor: 'azul' }));

    expect(style.backgroundColor).toBe('azul');
    expect(style['--foreground']).toBeUndefined();
  });
});
