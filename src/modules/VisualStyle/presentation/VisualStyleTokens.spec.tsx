import { renderToStaticMarkup } from 'react-dom/server';
import { VisualStyleTokens } from './VisualStyleTokens';

describe('VisualStyleTokens', () => {
  const css = (): string => renderToStaticMarkup(<VisualStyleTokens styleId="classic" />);

  it('emite las reglas de todos los estilos para poder cambiar de estilo por página o bloque', () => {
    expect(css()).toContain("[data-visual-style='claymorphism']");
    expect(css()).toContain("[data-visual-style='liquid-glass']");
  });

  it('una sección de color dentro de otro estilo conserva ese estilo y no vuelve al del sitio', () => {
    expect(css()).toContain(
      "[data-visual-style='claymorphism'],[data-visual-style='claymorphism'] [data-surface]{",
    );
  });

  it('un estilo desconocido cae al por defecto en vez de dejar el sitio sin tokens', () => {
    const html = renderToStaticMarkup(<VisualStyleTokens styleId="no-existe" />);

    expect(html).toContain('data-visual-style-tokens="classic"');
  });
});
