import { z } from 'zod';

export const PADDING_Y_VALUES = ['compact', 'normal', 'spacious'] as const;
export const CONTENT_WIDTH_VALUES = [
  'tight',
  'narrow',
  'medium',
  'normal',
  'wide',
  'full',
] as const;
export const TEXT_ALIGN_VALUES = ['left', 'center', 'right'] as const;

export type PaddingY = (typeof PADDING_Y_VALUES)[number];
export type ContentWidth = (typeof CONTENT_WIDTH_VALUES)[number];
export type TextAlign = (typeof TEXT_ALIGN_VALUES)[number];

// Fragmento común que cada bloque mezcla con `...SectionLayoutPropsSchema.shape`, igual que
// ya hace con el fondo. Los tres primeros campos son `optional` y no `default`: así el bloque
// distingue "no me lo pidieron" de "me pidieron normal" y puede traer su propio valor de
// fábrica, sin que eso le quite al editor la posibilidad de sobrescribirlo.
export const SectionLayoutPropsSchema = z.object({
  paddingY: z.enum(PADDING_Y_VALUES).optional().catch(undefined),
  contentWidth: z.enum(CONTENT_WIDTH_VALUES).optional().catch(undefined),
  textAlign: z.enum(TEXT_ALIGN_VALUES).optional().catch(undefined),
  animation: z.enum(['none', 'fade', 'slide']).default('none').catch('none'),
  hideOn: z.enum(['mobile', 'desktop']).nullable().default(null).catch(null),
});

export type SectionLayoutProps = z.infer<typeof SectionLayoutPropsSchema>;

export interface SectionLayoutDefaults {
  readonly paddingY?: PaddingY;
  readonly contentWidth?: ContentWidth;
  readonly textAlign?: TextAlign;
}

// El respiro entre secciones escala con `--brand-section-spacing`, para que la densidad
// elegida en la identidad de marca no afecte solo a la tipografía.
const spacing = (mobile: string, desktop: string): string =>
  `py-[calc(${mobile}*var(--brand-section-spacing,1))] md:py-[calc(${desktop}*var(--brand-section-spacing,1))]`;

const PADDING_Y_CLASS: Readonly<Record<PaddingY, string>> = {
  compact: spacing('3rem', '4rem'),
  normal: spacing('4rem', '5rem'),
  spacious: spacing('6rem', '8rem'),
};

const CONTENT_WIDTH_CLASS: Readonly<Record<ContentWidth, string>> = {
  tight: 'max-w-2xl',
  narrow: 'max-w-3xl',
  medium: 'max-w-4xl',
  normal: 'max-w-5xl',
  wide: 'max-w-6xl',
  full: 'max-w-none',
};

const TEXT_ALIGN_CLASS: Readonly<Record<TextAlign, string>> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const HIDE_ON_CLASS: Readonly<Record<'mobile' | 'desktop', string>> = {
  mobile: 'hidden md:block',
  desktop: 'md:hidden',
};

export interface SectionLayoutClasses {
  readonly section: string;
  readonly container: string;
}

export function sectionLayoutClasses(
  props: SectionLayoutProps,
  defaults: SectionLayoutDefaults = {},
): SectionLayoutClasses {
  const paddingY = props.paddingY ?? defaults.paddingY ?? 'normal';
  const contentWidth = props.contentWidth ?? defaults.contentWidth ?? 'normal';
  const textAlign = props.textAlign ?? defaults.textAlign ?? 'left';

  return {
    section: [PADDING_Y_CLASS[paddingY], props.hideOn === null ? '' : HIDE_ON_CLASS[props.hideOn]]
      .filter((value) => value !== '')
      .join(' '),
    container: [
      'mx-auto',
      CONTENT_WIDTH_CLASS[contentWidth],
      'px-6',
      TEXT_ALIGN_CLASS[textAlign],
    ].join(' '),
  };
}
