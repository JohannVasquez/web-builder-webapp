import { contrastRatio, parseHex, WCAG_AA_NORMAL_TEXT } from '@/shared/lib/color';
import { resolveBrandTheme } from '@/modules/Brand/domain/theme';
import type { BrandPalette } from '@/modules/Brand/domain/Brand';
import { VISUAL_STYLES } from './registry';
import { resolveTokenRgb, type CssVars } from './contrastAudit';

// Superficies con texto encima que cualquier bloque puede usar (`.ui-card`, `.ui-nav`, etc.);
// ninguna define su propio color de texto, así que todas leen `--foreground` (Spec 6.3, AA).
const SURFACE_TOKENS = ['--ui-card-bg', '--ui-input-bg', '--ui-nav-bg', '--ui-surface-bg'];

// Paleta neutra (la que sale de no personalizar nada) y una paleta con colores saturados, para
// que un estilo que mezcla `--primary` en su fondo no pase solo porque el neutro es benigno.
const PALETTES: Readonly<Record<string, BrandPalette>> = {
  neutral: {},
  vivid: { primary: '#e11d48', secondary: '#0ea5e9', accent: '#f59e0b', background: '#fffbeb' },
};

describe('contraste de los tokens de superficie en los 8 estilos visuales', () => {
  for (const style of VISUAL_STYLES) {
    for (const mode of ['light', 'dark'] as const) {
      for (const [paletteName, palette] of Object.entries(PALETTES)) {
        it(`${style.id} en modo ${mode} con paleta "${paletteName}" cumple AA (4.5:1) en sus superficies`, () => {
          const theme = resolveBrandTheme(palette)[mode];
          const vars: CssVars = {
            ...theme,
            ...style.tokens,
            ...(mode === 'dark' ? style.darkTokens ?? {} : {}),
          };
          const foreground = parseHex(vars['--foreground'] ?? '');
          expect(foreground).not.toBeNull();
          if (foreground === null) {
            return;
          }

          for (const token of SURFACE_TOKENS) {
            const rawValue = vars[token];
            if (rawValue === undefined) {
              continue;
            }
            const surfaceRgb = resolveTokenRgb(rawValue, vars);
            expect(surfaceRgb).not.toBeNull();
            if (surfaceRgb === null) {
              continue;
            }
            const ratio = contrastRatio(foreground, surfaceRgb);
            expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
          }
        });
      }
    }
  }
});
