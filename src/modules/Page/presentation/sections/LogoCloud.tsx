import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
  type SectionLayoutDefaults,
} from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import { HEADING_TAGS, type HeadingLevel } from '@/shared/lib/heading';
import { imageLoading } from '@/shared/lib/imageLoading';
import type { SectionComponentProps } from '../SectionComponentProps';

const LOGO_CLOUD_VARIANTS = ['row', 'marquee'] as const;

const LOGO_CLOUD_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof LOGO_CLOUD_VARIANTS)[number], SectionLayoutDefaults>
> = {
  row: { paddingY: 'compact', contentWidth: 'wide', textAlign: 'center' },
  marquee: { paddingY: 'compact', contentWidth: 'full', textAlign: 'center' },
};

const LogoCloudPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // `row` (default, fila fija que envuelve) o `marquee` (cinta en movimiento continuo).
  variant: z.enum(LOGO_CLOUD_VARIANTS).default('row').catch('row'),
  logos: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string(),
        href: z.string().optional(),
      }),
    )
    .default([]),
});

type Logo = z.infer<typeof LogoCloudPropsSchema>['logos'][number];

// Caja de ancho y alto fijos: no conocemos la proporción real del logo hasta que carga (Spec 6.2, CLS).
function LogoImage({ logo }: { readonly logo: Logo }): ReactElement {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
    <img
      src={logo.url}
      alt={logo.alt}
      width={96}
      height={36}
      className="h-9 w-24 shrink-0 object-contain opacity-70 grayscale transition-opacity hover:opacity-100 hover:grayscale-0"
      {...imageLoading()}
    />
  );
  if (logo.href === undefined) {
    return image;
  }
  return (
    <a href={logo.href} target="_blank" rel="noopener noreferrer" className="shrink-0">
      {image}
    </a>
  );
}

function LogoCloudHeader({
  eyebrow,
  title,
  hasBackgroundImage,
  headingLevel,
}: {
  readonly eyebrow: string | undefined;
  readonly title: string;
  readonly hasBackgroundImage: boolean;
  readonly headingLevel: HeadingLevel;
}): ReactElement | null {
  if (eyebrow === undefined && title === '') {
    return null;
  }
  const Heading = HEADING_TAGS[headingLevel];
  return (
    <div className="mb-8 text-center">
      {eyebrow !== undefined && (
        <p
          className={cn(
            'text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage && 'text-white/80',
          )}
        >
          {eyebrow}
        </p>
      )}
      {title !== '' && (
        <Heading
          className={cn(
            'ui-heading mt-2 text-2xl md:text-3xl',
            hasBackgroundImage && 'text-white',
          )}
        >
          {title}
        </Heading>
      )}
    </div>
  );
}

// Nombre único de la animación de esta sección: dos `LogoCloud` `marquee` en la misma página
// no deben compartir keyframes si alguna vez difieren en velocidad.
const MARQUEE_KEYFRAMES_NAME = 'logocloud-marquee';

export function LogoCloud({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const parsed = LogoCloudPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, logos, variant } = parsed.data;
  if (logos.length === 0) {
    return null;
  }
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, LOGO_CLOUD_LAYOUT_DEFAULTS[variant]);

  if (variant === 'marquee') {
    // Doble copia de los logos: la cinta se mueve exactamente la mitad de su ancho, así el
    // ciclo queda visualmente continuo. La animación es pura CSS por `@keyframes`, así la
    // regla global de `prefers-reduced-motion` (que apaga `animation-duration`) la detiene
    // de verdad, sin que este bloque repita esa media query.
    const track = [...logos, ...logos];
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <style>{`@keyframes ${MARQUEE_KEYFRAMES_NAME} { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          <LogoCloudHeader
            eyebrow={eyebrow}
            title={title}
            hasBackgroundImage={hasBackgroundImage}
            headingLevel={headingLevel}
          />
        </RevealOnScroll>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div
            className="flex w-max items-center gap-14 px-6"
            style={{ animation: `${MARQUEE_KEYFRAMES_NAME} 32s linear infinite` }}
          >
            {track.map((logo, index) => (
              <LogoImage key={`${index}-${logo.url}`} logo={logo} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        <LogoCloudHeader
          eyebrow={eyebrow}
          title={title}
          hasBackgroundImage={hasBackgroundImage}
          headingLevel={headingLevel}
        />
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {logos.map((logo, index) => (
            <LogoImage key={`${index}-${logo.url}`} logo={logo} />
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
