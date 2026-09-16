import { contrastRatio, parseHex, WCAG_AA_NORMAL_TEXT } from '@/shared/lib/color';
import { resolveBrandTheme, textScaleTokens } from './theme';

describe('resolveBrandTheme', () => {
  const ratio = (a: string, b: string): number =>
    contrastRatio(parseHex(a)!, parseHex(b)!);

  it('usa la paleta neutra cuando el cliente no definió nada', () => {
    const theme = resolveBrandTheme({});

    expect(theme.light['--background']).toBe('#ffffff');
    expect(theme.light['--primary']).toBe('#171717');
  });

  it('con solo el color principal ya devuelve un tema completo', () => {
    const theme = resolveBrandTheme({ primary: '#1d4ed8' });

    expect(theme.light['--primary']).toBe('#1d4ed8');
    expect(theme.light['--secondary']).toBeDefined();
    expect(theme.light['--muted-foreground']).toBeDefined();
    expect(theme.light['--border']).toBeDefined();
  });

  it('respeta el color de marca tal cual: es fondo de botón, no texto', () => {
    const theme = resolveBrandTheme({ primary: '#17104c', accent: '#fbbf24' });

    expect(theme.light['--primary']).toBe('#17104c');
    expect(theme.light['--brand-accent']).toBe('#fbbf24');
  });

  it('deja --secondary y --accent como superficies neutras, no como colores de marca', () => {
    const theme = resolveBrandTheme({ secondary: '#312e81', accent: '#fbbf24' });

    expect(theme.light['--secondary']).not.toBe('#312e81');
    expect(theme.light['--accent']).not.toBe('#fbbf24');
    expect(theme.light['--brand-secondary']).toBe('#312e81');
    expect(theme.light['--brand-accent']).toBe('#fbbf24');
  });

  it('el texto sobre cada color de marca cumple contraste AA', () => {
    const palettes = [
      { primary: '#17104c', secondary: '#312e81', accent: '#fbbf24' },
      { primary: '#0f766e', secondary: '#134e4a', accent: '#f59e0b' },
      { primary: '#ffffff' },
      { primary: '#000000' },
      { primary: '#808080' },
    ];
    for (const palette of palettes) {
      for (const scheme of [
        resolveBrandTheme(palette).light,
        resolveBrandTheme(palette).dark,
      ]) {
        for (const pair of [
          ['--primary', '--primary-foreground'],
          ['--secondary', '--secondary-foreground'],
          ['--accent', '--accent-foreground'],
          ['--brand-primary', '--brand-primary-foreground'],
          ['--brand-secondary', '--brand-secondary-foreground'],
          ['--brand-accent', '--brand-accent-foreground'],
          ['--background', '--foreground'],
          ['--background', '--muted-foreground'],
        ] as const) {
          expect(ratio(scheme[pair[0]], scheme[pair[1]])).toBeGreaterThanOrEqual(
            WCAG_AA_NORMAL_TEXT,
          );
        }
      }
    }
  });

  it('ajusta el color de marca cuando se usa como texto sobre el fondo', () => {
    const theme = resolveBrandTheme({ accent: '#fbbf24' });

    expect(
      ratio(theme.light['--brand-accent-text'], theme.light['--background']),
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('cae al valor por defecto si el color guardado no es un hex válido', () => {
    const theme = resolveBrandTheme({ primary: 'azul-marino' });

    expect(theme.light['--primary']).toBe('#171717');
  });

  it('devuelve un tema oscuro distinto del claro', () => {
    const theme = resolveBrandTheme({ primary: '#1d4ed8' });

    expect(theme.dark['--background']).not.toBe(theme.light['--background']);
    expect(theme.dark['--foreground']).not.toBe(theme.light['--foreground']);
  });

  it('traduce la escala de texto a un multiplicador', () => {
    expect(textScaleTokens('compact')['--brand-text-scale']).toBe('0.9375');
    expect(textScaleTokens('normal')['--brand-text-scale']).toBe('1');
    expect(textScaleTokens('spacious')['--brand-text-scale']).toBe('1.0625');
  });

  it('deriva el acento del color principal cuando el cliente no lo definió', () => {
    const theme = resolveBrandTheme({ primary: '#1d4ed8' });

    expect(theme.light['--brand-accent']).toBe('#1d4ed8');
    expect(theme.light['--brand-secondary']).not.toBe('#f5f5f5');
  });

  it('el texto de acento se lee aunque solo se haya definido el color principal', () => {
    const theme = resolveBrandTheme({ primary: '#1d4ed8' });

    expect(
      ratio(theme.light['--brand-accent-text'], theme.light['--background']),
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
