import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/utils';
import { imageLoading } from '@/shared/lib/imageLoading';
import { parseVideoUrl } from '@/modules/Page/presentation/sections/videoUrl';
import {
  BlogDividerBlockSchema,
  BlogHeadingBlockSchema,
  BlogImageBlockSchema,
  BlogListBlockSchema,
  BlogParagraphBlockSchema,
  BlogQuoteBlockSchema,
  BlogVideoBlockSchema,
  type BlogContentBlock,
} from '../domain/BlogPost';

interface BlogContentProps {
  readonly blocks: readonly BlogContentBlock[];
}

// Cada bloque se prueba contra la forma que sabe dibujar; el primero que valida gana. Un
// bloque de un tipo que este renderer no conoce todavía no matchea ninguna forma y se ignora
// en silencio, igual que `SectionRenderer` hace con un `type` de sección desconocido.
function renderBlock(block: BlogContentBlock, index: number): ReactElement | null {
  const paragraph = BlogParagraphBlockSchema.safeParse(block);
  if (paragraph.success) {
    return (
      <p key={index} className="text-base leading-relaxed">
        {paragraph.data.text}
      </p>
    );
  }

  const heading = BlogHeadingBlockSchema.safeParse(block);
  if (heading.success) {
    const Tag = heading.data.level === 2 ? 'h2' : 'h3';
    return (
      <Tag
        key={index}
        className={cn(
          'ui-heading',
          heading.data.level === 2 ? 'mt-10 text-2xl' : 'mt-8 text-xl',
        )}
      >
        {heading.data.text}
      </Tag>
    );
  }

  const list = BlogListBlockSchema.safeParse(block);
  if (list.success) {
    const ListTag = list.data.ordered ? 'ol' : 'ul';
    return (
      <ListTag
        key={index}
        className={cn(
          'ml-6 flex flex-col gap-2',
          list.data.ordered ? 'list-decimal' : 'list-disc',
        )}
      >
        {list.data.items.map((item, itemIndex) => (
          <li key={itemIndex}>{item}</li>
        ))}
      </ListTag>
    );
  }

  const quote = BlogQuoteBlockSchema.safeParse(block);
  if (quote.success) {
    return (
      <blockquote
        key={index}
        className="border-primary text-muted-foreground border-l-4 pl-4 italic"
      >
        <p>{quote.data.text}</p>
        {quote.data.cite !== undefined && (
          <cite className="mt-2 block text-sm not-italic">{quote.data.cite}</cite>
        )}
      </blockquote>
    );
  }

  const image = BlogImageBlockSchema.safeParse(block);
  if (image.success) {
    return (
      <figure key={index}>
        {
          // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
          <img
            src={image.data.key}
            alt={image.data.alt}
            className="w-full rounded-lg"
            {...imageLoading()}
          />
        }
        {image.data.caption !== undefined && (
          <figcaption className="text-muted-foreground mt-2 text-sm">
            {image.data.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const video = BlogVideoBlockSchema.safeParse(block);
  if (video.success) {
    const parsedVideo = parseVideoUrl(video.data.url);
    return (
      <figure key={index}>
        <div className="bg-muted aspect-video w-full overflow-hidden rounded-lg">
          {parsedVideo.kind === 'file' ? (
            <video src={parsedVideo.src} controls className="size-full" />
          ) : (
            <iframe
              src={parsedVideo.embedUrl ?? ''}
              title={video.data.caption ?? 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          )}
        </div>
        {video.data.caption !== undefined && (
          <figcaption className="text-muted-foreground mt-2 text-sm">
            {video.data.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const divider = BlogDividerBlockSchema.safeParse(block);
  if (divider.success) {
    return <hr key={index} className="ui-divider my-4" />;
  }

  return null;
}

export function BlogContent({ blocks }: BlogContentProps): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
