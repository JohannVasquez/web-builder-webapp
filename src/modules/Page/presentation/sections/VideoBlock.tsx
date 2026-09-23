'use client';

import { useState, type ReactElement } from 'react';
import { z } from 'zod';
import { Play } from 'lucide-react';
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
import { HEADING_TAGS } from '@/shared/lib/heading';
import type { SectionComponentProps } from '../SectionComponentProps';
import { parseVideoUrl } from './videoUrl';

const VIDEO_BLOCK_VARIANTS = ['contained', 'full'] as const;

const VIDEO_BLOCK_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof VIDEO_BLOCK_VARIANTS)[number], SectionLayoutDefaults>
> = {
  contained: { paddingY: 'normal', contentWidth: 'medium', textAlign: 'center' },
  full: { paddingY: 'normal', contentWidth: 'full', textAlign: 'center' },
};

const VideoBlockPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  videoUrl: z.string().optional(),
  // Portada mostrada antes de reproducir; sin ella se usa un fondo neutro.
  posterUrl: z.string().optional(),
  caption: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // `contained` (default, ancho máximo) o `full` (a todo el ancho de la sección).
  variant: z.enum(VIDEO_BLOCK_VARIANTS).default('contained').catch('contained'),
});

export function VideoBlock({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const parsed = VideoBlockPropsSchema.safeParse(sectionProps);
  const [started, setStarted] = useState(false);
  if (!parsed.success) {
    return null;
  }
  const Heading = HEADING_TAGS[headingLevel];
  const { eyebrow, title, videoUrl, posterUrl, caption, variant } = parsed.data;
  if (videoUrl === undefined || videoUrl.trim() === '') {
    return null;
  }

  const parsedVideo = parseVideoUrl(videoUrl);
  const layout = sectionLayoutClasses(parsed.data, VIDEO_BLOCK_LAYOUT_DEFAULTS[variant]);
  const playerTitle = title !== '' ? title : 'Video';

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {(eyebrow !== undefined || title !== '') && (
          <div className="mb-8">
            {eyebrow !== undefined && (
              <p className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
                {eyebrow}
              </p>
            )}
            {title !== '' && (
              <Heading className="ui-heading text-3xl md:text-4xl">{title}</Heading>
            )}
          </div>
        )}
        <div
          className={cn(
            'relative aspect-video w-full overflow-hidden bg-cover bg-center',
            variant === 'contained' ? 'ui-card' : 'bg-muted',
          )}
          style={
            !started && posterUrl !== undefined
              ? { backgroundImage: `url(${posterUrl})` }
              : undefined
          }
        >
          {started ? (
            parsedVideo.kind === 'file' ? (
              <video src={parsedVideo.src} controls autoPlay className="size-full" />
            ) : (
              <iframe
                src={`${parsedVideo.embedUrl}?autoplay=1`}
                title={playerTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            )
          ) : (
            <button
              type="button"
              onClick={() => setStarted(true)}
              aria-label="Reproducir video"
              className="focus-visible:ring-ring/50 absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-4"
            >
              <span className="ui-button bg-primary text-primary-foreground inline-flex size-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105">
                <Play className="ml-1 size-7" fill="currentColor" />
              </span>
            </button>
          )}
        </div>
        {caption !== undefined && (
          <p className="text-muted-foreground mt-4 text-sm">{caption}</p>
        )}
      </RevealOnScroll>
    </section>
  );
}
