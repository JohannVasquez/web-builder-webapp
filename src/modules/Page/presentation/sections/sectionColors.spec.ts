import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SECTIONS_DIR = __dirname;

// Blancos/negros: van sobre el velo de imagen de fondo, no sobre el tema.
const ALLOWED_COLOR_PATTERN = /^(white|black|#fff|#ffffff)$/i;

const HEX_COLOR_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_FUNCTION_PATTERN = /\brgba?\([^)]*\)/g;
const TAILWIND_PALETTE_PATTERN =
  /\b(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

function sectionFiles(): string[] {
  return readdirSync(SECTIONS_DIR).filter(
    (name) => name.endsWith('.tsx') && !name.endsWith('.spec.tsx'),
  );
}

function findViolations(content: string): string[] {
  const violations: string[] = [];

  for (const match of content.matchAll(HEX_COLOR_PATTERN)) {
    if (!ALLOWED_COLOR_PATTERN.test(match[0])) {
      violations.push(match[0]);
    }
  }
  for (const match of content.matchAll(RGB_FUNCTION_PATTERN)) {
    violations.push(match[0]);
  }
  for (const match of content.matchAll(TAILWIND_PALETTE_PATTERN)) {
    violations.push(match[0]);
  }

  return violations;
}

describe('sections: colores de marca solo vía tokens CSS', () => {
  const files = sectionFiles();

  it('encuentra al menos un archivo de sección para revisar', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)(
    '%s no trae colores literales fuera de la lista permitida',
    (fileName) => {
      const content = readFileSync(join(SECTIONS_DIR, fileName), 'utf-8');
      const violations = findViolations(content);

      if (violations.length > 0) {
        throw new Error(
          `${fileName} trae color(es) literal(es) fuera de los tokens de marca: ${violations.join(', ')}. ` +
            'Usa los tokens CSS de identidad de marca (var(--primary), var(--accent), etc.) o expón el color como prop.',
        );
      }
    },
  );
});
