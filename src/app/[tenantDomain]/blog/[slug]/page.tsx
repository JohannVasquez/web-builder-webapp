import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { createBlogService } from '@/modules/Blog/infrastructure/blogServiceFactory';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { BlogContent } from '@/modules/Blog/presentation/BlogContent';
import { BlogPostCard } from '@/modules/Blog/presentation/BlogPostCard';
import { BlogPostingJsonLd } from '@/modules/Blog/presentation/BlogPostingJsonLd';
import { ShareButtons } from '@/modules/Blog/presentation/ShareButtons';
import { formatPublishedAt } from '@/modules/Blog/presentation/blogDate';
import { canonical, NO_INDEX, robotsFor } from '@/shared/lib/seo';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';

interface BlogPostPageProps {
  readonly params: Promise<{ tenantDomain: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { tenantDomain, slug } = await params;
  const post = await createBlogService(tenantDomain).getPost(slug);
  if (post === null) {
    return { title: 'Publicación no encontrada', robots: NO_INDEX };
  }

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const image = post.ogImageUrl ?? post.coverImageUrl;

  return {
    title,
    description,
    robots: robotsFor(post.noindex),
    alternates: canonical(`/blog/${slug}`),
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt,
      images: image === null ? undefined : [{ url: image }],
    },
    twitter: {
      card: image === null ? 'summary' : 'summary_large_image',
      title,
      description,
      images: image === null ? undefined : [image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps): Promise<ReactElement> {
  const { tenantDomain, slug } = await params;
  const [post, settings] = await Promise.all([
    createBlogService(tenantDomain).getPost(slug),
    createGlobalSettingsService(tenantDomain).getSettings(),
  ]);

  if (post === null) {
    notFound();
  }

  const siteUrl = `https://${settings.primaryDomain ?? tenantDomain}`;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <BlogPostingJsonLd
        post={post}
        siteUrl={siteUrl}
        siteName={settings.siteName}
        logoUrl={
          settings.brand.assets.logoLight === undefined
            ? null
            : `${siteUrl}/brand-asset/logo-light`
        }
      />
      <div className="mb-8">
        <Breadcrumbs
          siteUrl={siteUrl}
          crumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title },
          ]}
        />
      </div>

      <header className="mb-10 flex flex-col gap-4">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <h1 className="ui-heading text-4xl md:text-5xl">{post.title}</h1>
        <p className="text-muted-foreground text-sm">
          {post.authorName} · {formatPublishedAt(post.publishedAt)} ·{' '}
          {post.readingMinutes} min de lectura
        </p>
      </header>

      {post.coverImageUrl !== null && (
        // eslint-disable-next-line @next/next/no-img-element -- URL dinámica del bucket, fuera del optimizador de next/image
        <img
          src={post.coverImageUrl}
          alt=""
          className="mb-10 aspect-16/9 w-full rounded-2xl object-cover"
        />
      )}

      <BlogContent blocks={post.content} />

      <footer className="mt-12 border-t pt-8">
        <ShareButtons url={`${siteUrl}/blog/${post.slug}`} title={post.title} />
      </footer>

      {post.related.length > 0 && (
        <section className="mt-16">
          <h2 className="ui-heading mb-6 text-2xl">Publicaciones relacionadas</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {post.related.map((related) => (
              <BlogPostCard key={related.slug} post={related} variant="grid" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
