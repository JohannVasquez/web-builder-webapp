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
});
