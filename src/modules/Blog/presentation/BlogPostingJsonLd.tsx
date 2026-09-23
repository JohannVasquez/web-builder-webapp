import type { ReactElement } from 'react';
import type { BlogPostDetail } from '../domain/BlogPost';

interface BlogPostingJsonLdProps {
  readonly post: BlogPostDetail;
  readonly siteUrl: string;
  readonly siteName: string;
  readonly logoUrl?: string | null;
}

// Datos estructurados de artículo: sin esto un buscador ve el post como texto suelto en vez
// de una publicación con autor y fecha (mismo criterio que `SiteJsonLd`, SPEC 6.1/7.4).
export function BlogPostingJsonLd({
  post,
  siteUrl,
  siteName,
  logoUrl = null,
}: BlogPostingJsonLdProps): ReactElement {
  const image = post.ogImageUrl ?? post.coverImageUrl;
  const url = `${siteUrl}/blog/${post.slug}`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    // Una publicación que se corrige y no lo declara se ve tan vieja como el día que salió.
    // Si la API todavía no manda `updatedAt`, la fecha de publicación es lo más honesto.
    dateModified: post.updatedAt ?? post.publishedAt,
    url,
    // `mainEntityOfPage` es lo que ata el artículo a ESTA URL: sin él, un agregador que copie
    // el marcado se atribuye el original.
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Person', name: post.authorName },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      ...(logoUrl === null ? {} : { logo: { '@type': 'ImageObject', url: logoUrl } }),
    },
    ...(image === null ? {} : { image }),
    ...(post.tags.length === 0
      ? {}
      : { keywords: post.tags.join(', '), articleSection: post.tags[0] }),
  };

  return (
    <script
      type="application/ld+json"
      // El contenido sale del propio post, ya validado por el schema del blog.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
