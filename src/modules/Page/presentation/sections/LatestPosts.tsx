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
import { BlogPostCard } from '@/modules/Blog/presentation/BlogPostCard';
import type { SectionComponentProps } from '../SectionComponentProps';

const LATEST_POSTS_VARIANTS = ['grid', 'list'] as const;
const DEFAULT_COUNT = 3;

const LATEST_POSTS_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof LATEST_POSTS_VARIANTS)[number], SectionLayoutDefaults>
> = {
  grid: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
  list: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
};

const LatestPostsPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  count: z.number().int().positive().default(DEFAULT_COUNT).catch(DEFAULT_COUNT),
  tag: z.string().optional(),
  // `grid` (default, tarjetas) o `list` (una columna, más compacta).
  variant: z.enum(LATEST_POSTS_VARIANTS).default('grid').catch('grid'),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
});

// Único bloque que necesita datos de otro módulo: los demás reciben todo resuelto en
// `sectionProps`. `blogService` viaja por `SectionComponentProps` desde `SectionRenderer`,
// ya construido por la página del tenant (`src/app`, fuera de la regla de capas que le
// impide a este componente de `presentation` importar `blogServiceFactory` directamente).
// Sin él no hay a quién pedirle publicaciones, así que el bloque no se muestra (mismo
// resultado que en la guía de estilos, que no construye ningún blog).
export async function LatestPosts({
  sectionProps,
  blogService,
}: SectionComponentProps): Promise<ReactElement | null> {
  const parsed = LatestPostsPropsSchema.safeParse(sectionProps);
  if (!parsed.success || blogService === undefined) {
    return null;
  }
  const { eyebrow, title, count, tag, variant } = parsed.data;

  const { posts } = await blogService.listPosts({
    page: 1,
    perPage: count,
    tag,
  });

  // Sin publicaciones el bloque no se muestra, en vez de dejar una sección vacía en la página.
  if (posts.length === 0) {
    return null;
  }

  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, LATEST_POSTS_LAYOUT_DEFAULTS[variant]);

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
            variant === 'grid'
              ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-6',
          )}
        >
          {posts.map((post) => (
            <BlogPostCard
              key={post.slug}
              post={post}
              variant={variant}
              lightText={hasBackgroundImage}
            />
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
