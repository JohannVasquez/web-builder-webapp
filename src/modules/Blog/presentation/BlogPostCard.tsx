import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/utils';
import { mediaSrc } from '@/shared/lib/mediaSrc';
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
  // La clave da una dirección estable; la URL firmada es el respaldo mientras la API no la
  // mande (ver `mediaSrc` y web-builder-api#87).
  const cover = mediaSrc(post.coverImageKey) ?? post.coverImageUrl;

  return (
    <Link
      href={`/blog/${post.slug}`}
      data-variant={variant}
      className={cn(
        'group flex gap-4',
        isGrid ? 'ui-card flex-col overflow-hidden p-0' : 'items-start',
      )}
    >
      {cover !== null && (
        <div
          className={cn(
            'relative overflow-hidden',
            isGrid ? 'aspect-16/9 w-full' : 'aspect-square size-24 shrink-0 rounded-lg',
          )}
        >
          {/* `fill` sobre un contenedor con proporción: la imagen no necesita traer sus
              dimensiones para que no haya salto de maquetación. */}
          <Image
            src={cover}
            alt=""
            fill
            sizes={isGrid ? '(min-width: 640px) 50vw, 100vw' : '96px'}
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
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
