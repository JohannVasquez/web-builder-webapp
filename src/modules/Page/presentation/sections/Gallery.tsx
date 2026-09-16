'use client';

import { useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
import type { SectionComponentProps } from '../SectionComponentProps';

const GALLERY_VARIANTS = ['grid', 'masonry'] as const;

const GALLERY_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof GALLERY_VARIANTS)[number], SectionLayoutDefaults>
> = {
  grid: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
  masonry: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
};

const GalleryPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // `grid` (default, celdas parejas) o `masonry` (columnas con alturas naturales).
  variant: z.enum(GALLERY_VARIANTS).default('grid').catch('grid'),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      }),
    )
    .default([]),
});

// Imágenes cargadas de inmediato antes de que aparezcan bajo el pliegue; el resto usa `lazy`.
const EAGER_COUNT = 3;

function GalleryImg({
  src,
  alt,
  eager,
  className,
}: {
  readonly src: string;
  readonly alt: string;
  readonly eager: boolean;
  readonly className: string;
}): ReactElement {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
    <img src={src} alt={alt} loading={eager ? undefined : 'lazy'} className={className} />
  );
}

export function Gallery({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = GalleryPropsSchema.safeParse(sectionProps);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, images, variant } = parsed.data;
  if (images.length === 0) {
    return null;
  }
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, GALLERY_LAYOUT_DEFAULTS[variant]);

  const openAt = (index: number): void => {
    setActiveIndex(index);
    dialogRef.current?.showModal();
  };
  const close = (): void => {
    dialogRef.current?.close();
  };
  const step = (delta: number): void => {
    setActiveIndex((current) =>
      current === null ? current : (current + delta + images.length) % images.length,
    );
  };
  const onDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>): void => {
    if (event.key === 'ArrowRight') {
      step(1);
    }
    if (event.key === 'ArrowLeft') {
      step(-1);
    }
  };

  const active = activeIndex === null ? null : images[activeIndex];

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {eyebrow !== undefined && (
          <p
            className={cn(
              'mb-2 text-sm font-semibold tracking-wide uppercase',
              hasBackgroundImage && 'text-white/80',
            )}
          >
            {eyebrow}
          </p>
        )}
        {title !== '' && (
          <h2
            className={cn(
              'ui-heading mb-8 text-3xl md:text-4xl',
              hasBackgroundImage && 'text-white',
            )}
          >
            {title}
          </h2>
        )}
        <div
          className={cn(
            variant === 'masonry'
              ? 'columns-2 gap-4 sm:columns-3'
              : 'grid grid-cols-2 gap-4 sm:grid-cols-3',
          )}
        >
          {images.map((image, index) => (
            <button
              key={`${index}-${image.url}`}
              type="button"
              onClick={() => openAt(index)}
              aria-label={image.alt !== '' ? image.alt : `Ampliar imagen ${index + 1}`}
              className={cn(
                'ui-card mb-4 block w-full overflow-hidden p-0',
                variant === 'grid' && 'mb-0 aspect-square',
              )}
            >
              <GalleryImg
                src={image.url}
                alt={image.alt}
                eager={index < EAGER_COUNT}
                className={cn(
                  'w-full transition-transform hover:scale-105',
                  variant === 'grid' ? 'h-full object-cover' : 'h-auto',
                )}
              />
            </button>
          ))}
        </div>
      </RevealOnScroll>
      <dialog
        ref={dialogRef}
        onClose={() => setActiveIndex(null)}
        onKeyDown={onDialogKeyDown}
        className="ui-card m-auto max-w-3xl bg-transparent p-0 backdrop:bg-black/80"
      >
        {active !== null && (
          <div className="relative flex flex-col">
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="ui-button bg-secondary text-secondary-foreground absolute top-3 right-3 z-10 flex size-9 items-center justify-center"
            >
              <X className="size-5" />
            </button>
            <GalleryImg
              src={active.url}
              alt={active.alt}
              eager
              className="max-h-[80vh] w-full object-contain"
            />
            {active.caption !== undefined && (
              <p className="text-muted-foreground p-4 text-sm">{active.caption}</p>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Imagen anterior"
                  className="ui-button bg-secondary text-secondary-foreground absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Siguiente imagen"
                  className="ui-button bg-secondary text-secondary-foreground absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
