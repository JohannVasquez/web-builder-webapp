import type { BlogPostSummary } from '../domain/BlogPost';

export interface RssChannelInfo {
  readonly siteName: string;
  readonly siteUrl: string;
  readonly description: string;
}

// Un título con `&`, `<` o `>` sin escapar rompe el XML entero, no solo esa entrada: por eso
// se escapa siempre, aunque el texto venga de un campo que hoy nunca los use.
export const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const buildItem = (post: BlogPostSummary, siteUrl: string): string => {
  const link = `${siteUrl}/blog/${post.slug}`;
  const pubDate = new Date(post.publishedAt).toUTCString();
  return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <description>${escapeXml(post.excerpt)}</description>
    <pubDate>${pubDate}</pubDate>
  </item>`;
};

// Canal RSS 2.0 del blog del tenant (SPEC 7.4). `posts` ya debe venir filtrado a las
// publicaciones visibles: esta función solo arma el XML, no decide qué es visible.
export function buildBlogRssXml(
  channel: RssChannelInfo,
  posts: readonly BlogPostSummary[],
): string {
  const items = posts.map((post) => buildItem(post, channel.siteUrl)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(channel.siteName)}</title>
  <link>${channel.siteUrl}/blog</link>
  <description>${escapeXml(channel.description)}</description>
${items}
</channel>
</rss>`;
}
