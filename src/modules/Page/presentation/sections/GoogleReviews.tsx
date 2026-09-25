import Image from 'next/image';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { ExternalLink, Star } from 'lucide-react';
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
import { HEADING_TAGS } from '@/shared/lib/heading';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const GOOGLE_REVIEWS_VARIANTS = ['summary', 'cards'] as const;

const GOOGLE_REVIEWS_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof GOOGLE_REVIEWS_VARIANTS)[number], SectionLayoutDefaults>
> = {
  summary: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'center' },
  cards: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
};

const GoogleReviewsPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  profileUrl: z.string().optional(),
  // `summary` (default, calificación grande + reseñas destacadas) o `cards` (grilla de reseñas).
  variant: z.enum(GOOGLE_REVIEWS_VARIANTS).default('summary').catch('summary'),
  reviews: z
    .array(
      z.object({
        author: z.string(),
        rating: z.number().int().min(0).max(5),
        text: z.string(),
        date: z.string().optional(),
        avatarUrl: z.string().optional(),
      }),
    )
    .default([]),
});

type Review = z.infer<typeof GoogleReviewsPropsSchema>['reviews'][number];

const RATING_FORMATTER = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });
const COUNT_FORMATTER = new Intl.NumberFormat('es-CL');

function StarRating({
  rating,
  size,
}: {
  readonly rating: number;
  readonly size: string;
}): ReactElement {
  const filled = Math.round(rating);
  return (
    <div
      className="text-primary flex gap-0.5"
      role="img"
      aria-label={`${RATING_FORMATTER.format(rating)} de 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(size, index < filled ? 'fill-current' : 'fill-none opacity-30')}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { readonly review: Review }): ReactElement {
  return (
    <div className="ui-card flex flex-col gap-3 p-6">
      <div className="flex items-center gap-3">
        {review.avatarUrl !== undefined ? (
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
            <Image
              src={review.avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : (
          <div
            className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            aria-hidden="true"
          >
            {review.author.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{review.author}</p>
          {review.date !== undefined && (
            <p className="text-muted-foreground text-xs">{review.date}</p>
          )}
        </div>
      </div>
      <StarRating rating={review.rating} size="size-4" />
      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
        {review.text}
      </p>
    </div>
  );
}

function ProfileLink({
  profileUrl,
  hasBackgroundImage,
}: {
  readonly profileUrl: string | undefined;
  readonly hasBackgroundImage: boolean;
}): ReactElement | null {
  if (profileUrl === undefined) {
    return null;
  }
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-semibold hover:underline',
        hasBackgroundImage ? 'text-white' : 'text-primary',
      )}
    >
      Ver todas en Google
      <ExternalLink className="size-4" />
    </a>
  );
}

export function GoogleReviews({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const Heading = HEADING_TAGS[headingLevel];
  const parsed = GoogleReviewsPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, rating, reviewCount, profileUrl, reviews, variant } =
    parsed.data;
  if (reviews.length === 0) {
    return null;
  }
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(
    parsed.data,
    GOOGLE_REVIEWS_LAYOUT_DEFAULTS[variant],
  );

  const header = (eyebrow !== undefined || title !== '') && (
    <div className="mb-8 flex flex-col gap-2">
      {eyebrow !== undefined && (
        <p
          className={cn(
            'text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      {title !== '' && (
        <Heading
          className={cn(
            'ui-heading text-3xl md:text-4xl',
            hasBackgroundImage && 'text-white',
          )}
        >
          {title}
        </Heading>
      )}
    </div>
  );

  if (variant === 'cards') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <StarRating rating={rating} size="size-5" />
            <span className={hasBackgroundImage ? 'text-white' : undefined}>
              {RATING_FORMATTER.format(rating)} · {COUNT_FORMATTER.format(reviewCount)}{' '}
              reseñas
            </span>
            <ProfileLink
              profileUrl={profileUrl}
              hasBackgroundImage={hasBackgroundImage}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={`${review.author}-${review.date ?? ''}`} review={review} />
            ))}
          </div>
        </RevealOnScroll>
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
        {header}
        <div className="mb-10 flex flex-col items-center gap-3">
          <span className={cn('text-5xl font-bold', hasBackgroundImage && 'text-white')}>
            {RATING_FORMATTER.format(rating)}
          </span>
          <StarRating rating={rating} size="size-6" />
          <p className={hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground'}>
            Basado en {COUNT_FORMATTER.format(reviewCount)} reseñas de Google
          </p>
          <ProfileLink profileUrl={profileUrl} hasBackgroundImage={hasBackgroundImage} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard key={`${review.author}-${review.date ?? ''}`} review={review} />
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
