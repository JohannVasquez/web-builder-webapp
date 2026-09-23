import type { ReactElement } from 'react';
import type { BlogPostDetail } from '../domain/BlogPost';

interface BlogPostingJsonLdProps {
  readonly post: BlogPostDetail;
  readonly siteUrl: string;
  readonly siteName: string;
}

// Datos estructurados de artículo: sin esto un buscador ve el post como texto suelto en vez
// de una publicación con autor y fecha (mismo criterio que `LocalBusinessJsonLd`, SPEC 6.1/7.4).
export function BlogPostingJsonLd({
  post,
  siteUrl,
  siteName,
}: BlogPostingJsonLdProps): ReactElement {
  const image = post.ogImageUrl ?? post.coverImageUrl;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    url: `${siteUrl}/blog/${post.slug}`,
    author: { '@type': 'Person', name: post.authorName },
    publisher: { '@type': 'Organization', name: siteName },
    ...(image === null ? {} : { image }),
    ...(post.tags.length === 0 ? {} : { keywords: post.tags.join(', ') }),
  };

  return (
    <script
      type="application/ld+json"
      // El contenido sale del propio post, ya validado por el schema del blog.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
