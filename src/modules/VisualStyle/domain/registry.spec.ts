import { DEFAULT_VISUAL_STYLE_ID, VISUAL_STYLES, findVisualStyle } from './registry';
import { classic } from './styles/classic';

describe('registro de estilos visuales', () => {
  it('trae al menos los cuatro estilos de la primera entrega', () => {
    expect(VISUAL_STYLES.length).toBeGreaterThanOrEqual(4);
    const ids = VISUAL_STYLES.map((style) => style.id);
    expect(ids).toEqual(
      expect.arrayContaining(['classic', 'glassmorphism', 'neo-brutalism', 'minimal']),
    );
  });

  it('no repite ids', () => {
    const ids = VISUAL_STYLES.map((style) => style.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cae al estilo clásico ante un id desconocido en vez de romperse', () => {
    expect(findVisualStyle('no-existe').id).toBe(DEFAULT_VISUAL_STYLE_ID);
    expect(findVisualStyle('').id).toBe(DEFAULT_VISUAL_STYLE_ID);
  });

  it('todos declaran exactamente el mismo juego de tokens', () => {
    const expected = Object.keys(classic.tokens).sort();
    for (const style of VISUAL_STYLES) {
      expect(Object.keys(style.tokens).sort()).toEqual(expected);
    }
  });

  it('todos tienen etiqueta y descripción, porque el panel y el MCP las muestran', () => {
    for (const style of VISUAL_STYLES) {
      expect(style.label.length).toBeGreaterThan(0);
      expect(style.description.length).toBeGreaterThan(0);
    }
  });

  it('el botón del Neo-Brutalism se hunde al presionarlo', () => {
    const neo = findVisualStyle('neo-brutalism');
    expect(neo.tokens['--ui-button-active-translate']).not.toBe('0px');
  });

  it('Glassmorphism trae una alternativa sólida donde no hay backdrop-filter', () => {
    const glass = findVisualStyle('glassmorphism');
    expect(glass.css).toContain('@supports not');
  });

  it('trae los ocho estilos de la segunda entrega', () => {
    expect(VISUAL_STYLES.length).toBe(8);
    const ids = VISUAL_STYLES.map((style) => style.id);
    expect(ids).toEqual(
      expect.arrayContaining(['soft-ui', 'bento', 'editorial', 'aurora']),
    );
  });

  // Un estilo no puede traer su propia paleta: todo color sale de var(--background),
  // var(--foreground), var(--primary), var(--brand-accent) o color-mix() sobre ellos.
  // Se permite rgb()/rgba() solo para negro o blanco con alfa, como ya hace Classic.
  it('ningún estilo declara colores literales en sus tokens ni en su css', () => {
    const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/;
    const RGB_FUNCTION = /rgba?\([^)]*\)/g;
    const isAllowedRgb = (fn: string): boolean =>
      /rgba?\(\s*(0\s+0\s+0|255\s+255\s+255)\b/.test(fn);
    const hasLiteralColor = (value: string): boolean => {
      if (HEX_COLOR.test(value)) return true;
      const matches = value.match(RGB_FUNCTION) ?? [];
      return matches.some((match) => !isAllowedRgb(match));
    };

    for (const style of VISUAL_STYLES) {
      const serialized =
        JSON.stringify(style.tokens) +
        JSON.stringify(style.darkTokens ?? {}) +
        (style.css ?? '');
      expect(hasLiteralColor(serialized)).toBe(false);
    }
  });

  it('Aurora anima su fondo con un keyframe propio y no duplica el media query global', () => {
    const aurora = findVisualStyle('aurora');
    expect(aurora.css).toMatch(/@keyframes\s+aurora-[\w-]+/);
    expect(aurora.css).not.toContain('prefers-reduced-motion');
  });

  it('todo estilo con css extra lo scopea con su propio [data-visual-style]', () => {
    for (const style of VISUAL_STYLES) {
      if (style.css !== undefined) {
        expect(style.css).toContain(`[data-visual-style='${style.id}']`);
      }
    }
  });
});
