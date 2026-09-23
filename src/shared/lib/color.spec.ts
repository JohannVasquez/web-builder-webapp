import {
  BLACK,
  WHITE,
  contrastRatio,
  ensureContrast,
  isHexColor,
  parseHex,
  readableForeground,
  relativeLuminance,
  toHex,
  WCAG_AA_NORMAL_TEXT,
} from './color';

describe('color', () => {
  it('acepta hex de 3 y de 6 dígitos y rechaza el resto', () => {
    expect(isHexColor('#abc')).toBe(true);
    expect(isHexColor('#1d4ed8')).toBe(true);
    expect(isHexColor('rojo')).toBe(false);
    expect(isHexColor('#12345')).toBe(false);
    expect(isHexColor('rgb(1,2,3)')).toBe(false);
  });

  it('expande el hex corto al largo equivalente', () => {
    expect(parseHex('#abc')).toEqual(parseHex('#aabbcc'));
  });

  it('devuelve null para un hex inválido en vez de lanzar', () => {
    expect(parseHex('nada')).toBeNull();
  });

  it('va y vuelve entre hex y rgb sin perder el color', () => {
    expect(toHex(parseHex('#1d4ed8')!)).toBe('#1d4ed8');
  });

  it('calcula la luminancia de los extremos conocidos', () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 5);
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 5);
  });

  it('da el contraste máximo de la WCAG entre blanco y negro', () => {
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 1);
  });

  it('da el mismo contraste sin importar el orden de los colores', () => {
    const a = parseHex('#1d4ed8')!;
    expect(contrastRatio(a, WHITE)).toBeCloseTo(contrastRatio(WHITE, a), 10);
  });

  it('elige un texto legible sobre CUALQUIER color de fondo', () => {
    const samples = [
      '#ffffff',
      '#000000',
      '#1d4ed8',
      '#fbbf24',
      '#808080',
      '#17104c',
      '#0f766e',
      '#f59e0b',
      '#7f7f7f',
      '#e5e5e5',
      '#dc2626',
      '#16a34a',
    ];
    for (const hex of samples) {
      const background = parseHex(hex)!;
      const ratio = contrastRatio(readableForeground(background), background);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    }
  });

  it('aclara un color de marca que no se despega del fondo oscuro', () => {
    const background = parseHex('#0b0b0d')!;
    const tooDark = parseHex('#17104c')!;

    const fixed = ensureContrast(tooDark, background);

    expect(contrastRatio(tooDark, background)).toBeLessThan(WCAG_AA_NORMAL_TEXT);
    expect(contrastRatio(fixed, background)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('oscurece un color de marca que se pierde sobre fondo claro', () => {
    const background = WHITE;
    const tooLight = parseHex('#fde68a')!;

    const fixed = ensureContrast(tooLight, background);

    expect(contrastRatio(fixed, background)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('deja intacto un color que ya contrasta lo suficiente', () => {
    const background = WHITE;
    const fine = parseHex('#1d4ed8')!;

    expect(ensureContrast(fine, background)).toEqual(fine);
  });
});
