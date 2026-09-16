import { SectionLayoutPropsSchema, sectionLayoutClasses } from './sectionLayout';

describe('sectionLayoutClasses', () => {
  it('sin props ni defaults cae en normal/normal/left', () => {
    const parsed = SectionLayoutPropsSchema.parse({});
    const layout = sectionLayoutClasses(parsed);

    expect(layout.section).toContain('py-[calc(4rem*var(--brand-section-spacing,1))]');
    expect(layout.section).toContain('md:py-[calc(5rem*var(--brand-section-spacing,1))]');
    expect(layout.section).not.toContain('hidden');
    expect(layout.section).not.toContain('md:hidden');
    expect(layout.container).toBe('mx-auto max-w-5xl px-6 text-left');
  });

  it('sin prop usa el default del bloque', () => {
    const parsed = SectionLayoutPropsSchema.parse({});
    const layout = sectionLayoutClasses(parsed, {
      paddingY: 'spacious',
      contentWidth: 'wide',
      textAlign: 'center',
    });

    expect(layout.section).toContain('py-[calc(6rem*var(--brand-section-spacing,1))]');
    expect(layout.container).toBe('mx-auto max-w-6xl px-6 text-center');
  });

  it('una prop explícita siempre gana sobre el default del bloque', () => {
    const parsed = SectionLayoutPropsSchema.parse({
      paddingY: 'compact',
      contentWidth: 'tight',
      textAlign: 'right',
    });
    const layout = sectionLayoutClasses(parsed, {
      paddingY: 'spacious',
      contentWidth: 'wide',
      textAlign: 'center',
    });

    expect(layout.section).toContain('py-[calc(3rem*var(--brand-section-spacing,1))]');
    expect(layout.container).toBe('mx-auto max-w-2xl px-6 text-right');
  });

  it.each([
    ['compact', 'py-[calc(3rem*var(--brand-section-spacing,1))]'],
    ['normal', 'py-[calc(4rem*var(--brand-section-spacing,1))]'],
    ['spacious', 'py-[calc(6rem*var(--brand-section-spacing,1))]'],
  ] as const)('paddingY %s produce %s', (paddingY, expectedClass) => {
    const parsed = SectionLayoutPropsSchema.parse({ paddingY });

    expect(sectionLayoutClasses(parsed).section).toContain(expectedClass);
  });

  it('el padding responsive tiene variante md: e incluye la escala de marca', () => {
    const parsed = SectionLayoutPropsSchema.parse({ paddingY: 'normal' });
    const { section } = sectionLayoutClasses(parsed);

    expect(section).toContain('var(--brand-section-spacing');
    expect(section).toMatch(/\bmd:py-\[/);
  });

  it.each([
    ['tight', 'max-w-2xl'],
    ['narrow', 'max-w-3xl'],
    ['medium', 'max-w-4xl'],
    ['normal', 'max-w-5xl'],
    ['wide', 'max-w-6xl'],
    ['full', 'max-w-none'],
  ] as const)('contentWidth %s produce %s', (contentWidth, expectedClass) => {
    const parsed = SectionLayoutPropsSchema.parse({ contentWidth });

    expect(sectionLayoutClasses(parsed).container).toContain(expectedClass);
  });

  it.each([
    ['left', 'text-left'],
    ['center', 'text-center'],
    ['right', 'text-right'],
  ] as const)('textAlign %s produce %s', (textAlign, expectedClass) => {
    const parsed = SectionLayoutPropsSchema.parse({ textAlign });

    expect(sectionLayoutClasses(parsed).container).toContain(expectedClass);
  });

  it('hideOn "mobile" oculta en mobile y muestra desde md', () => {
    const parsed = SectionLayoutPropsSchema.parse({ hideOn: 'mobile' });

    expect(sectionLayoutClasses(parsed).section).toContain('hidden md:block');
  });

  it('hideOn "desktop" oculta desde md', () => {
    const parsed = SectionLayoutPropsSchema.parse({ hideOn: 'desktop' });

    expect(sectionLayoutClasses(parsed).section).toContain('md:hidden');
  });

  it('hideOn null no agrega ninguna clase de visibilidad', () => {
    const parsed = SectionLayoutPropsSchema.parse({ hideOn: null });

    const { section } = sectionLayoutClasses(parsed);
    expect(section).not.toContain('hidden');
    expect(section).not.toContain('block');
  });

  it('un paddingY desconocido cae a undefined y usa el default del bloque', () => {
    const parsed = SectionLayoutPropsSchema.parse({ paddingY: 'gigante' });

    expect(parsed.paddingY).toBeUndefined();
    expect(sectionLayoutClasses(parsed, { paddingY: 'spacious' }).section).toContain(
      'py-[calc(6rem*var(--brand-section-spacing,1))]',
    );
  });

  it('un contentWidth desconocido cae a undefined y usa el default del bloque', () => {
    const parsed = SectionLayoutPropsSchema.parse({ contentWidth: 'enorme' });

    expect(parsed.contentWidth).toBeUndefined();
    expect(sectionLayoutClasses(parsed, { contentWidth: 'tight' }).container).toContain(
      'max-w-2xl',
    );
  });

  it('un hideOn desconocido cae al default (null) en vez de romper el bloque', () => {
    const parsed = SectionLayoutPropsSchema.parse({ hideOn: 'reloj' });

    expect(parsed.hideOn).toBeNull();
    expect(sectionLayoutClasses(parsed).section).not.toContain('hidden');
  });

  it.each([
    ['none', 'none'],
    ['fade', 'fade'],
    ['slide', 'slide'],
  ] as const)('animation %s se valida y conserva tal cual', (animation, expected) => {
    const parsed = SectionLayoutPropsSchema.parse({ animation });

    expect(parsed.animation).toBe(expected);
  });
});
