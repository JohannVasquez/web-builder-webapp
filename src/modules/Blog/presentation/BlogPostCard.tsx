import Link from 'next/link';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/utils';
import { imageLoading } from '@/shared/lib/imageLoading';
import type { BlogPostSummary } from '../domain/BlogPost';
import { formatPublishedAt } from './blogDate';

export const BLOG_POST_CARD_VARIANTS = ['grid', 'list'] as const;
export type BlogPostCardVariant = (typeof BLOG_POST_CARD_VARIANTS)[number];

interface BlogPostCardProps {
  readonly post: BlogPostSummary;
  // `grid` (default, tarjeta) o `list` (una fila, foto pequeña a un lado).
  readonly variant?: BlogPostCardVariant;
  readonly lightText?: boolean;
}

// Tarjeta de una publicación, compartida entre el listado del blog (SPEC 7.2) y el bloque
// "Últimas publicaciones" (SPEC 7.3) para que ambos se vean y se comporten igual.
export function BlogPostCard({
  post,
  variant = 'grid',
  lightText = false,
}: BlogPostCardProps): ReactElement {
  const isGrid = variant === 'grid';

  return (
    <Link
      href={`/blog/${post.slug}`}
      data-variant={variant}
      className={cn(
        'group flex gap-4',
        isGrid ? 'ui-card flex-col overflow-hidden p-0' : 'items-start',
      )}
    >
      {post.coverImageUrl !== null && (
        // eslint-disable-next-line @next/next/no-img-element -- URL dinámica del bucket, fuera del optimizador de next/image
        <img
          src={post.coverImageUrl}
          alt=""
          className={cn(
            'object-cover transition-transform group-hover:scale-105',
            isGrid ? 'aspect-16/9 w-full' : 'aspect-square size-24 shrink-0 rounded-lg',
          )}
          {...imageLoading()}
        />
      )}
      <div className={cn('flex flex-col gap-2', isGrid && 'p-6')}>
        <h3
          className={cn(
            'text-lg font-semibold group-hover:underline',
            lightText && 'text-white',
          )}
        >
          {post.title}
        </h3>
        <p
          className={cn(
            'line-clamp-2 text-sm',
            lightText ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {post.excerpt}
        </p>
        <p
          className={cn('text-xs', lightText ? 'text-white/60' : 'text-muted-foreground')}
        >
          {formatPublishedAt(post.publishedAt)} · {post.readingMinutes} min de lectura
        </p>
      </div>
    </Link>
  );
}
