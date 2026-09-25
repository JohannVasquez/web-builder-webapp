import {
  BlogListResponseSchema,
  BlogPostResponseSchema,
  type BlogListResponse,
  type BlogPostDetail,
} from '../domain/BlogPost';
import type { BlogListParams, BlogRepository } from '../domain/BlogRepository';

import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import { siteCacheOptions } from '@/shared/lib/cacheTags';

export class ApiBlogRepository implements BlogRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantDomain?: string,
  ) {}

  private tenantHeaders(): HeadersInit | undefined {
    return this.tenantDomain === undefined
      ? undefined
      : { [TENANT_DOMAIN_HEADER]: this.tenantDomain };
  }

  public async listPosts(params: BlogListParams): Promise<BlogListResponse> {
    const query = new URLSearchParams({
      page: String(params.page),
      perPage: String(params.perPage),
    });
    if (params.tag !== undefined) {
      query.set('tag', params.tag);
    }

    const options = await siteCacheOptions(this.tenantDomain);
    const response = await fetch(`${this.baseUrl}/api/blog?${query.toString()}`, {
      ...options,
      headers: { ...options.headers, ...this.tenantHeaders() },
    });
    if (!response.ok) {
      throw new Error(`Failed to list blog posts: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return BlogListResponseSchema.parse(payload);
  }

  public async findBySlug(slug: string): Promise<BlogPostDetail | null> {
    const options = await siteCacheOptions(this.tenantDomain);
    const response = await fetch(`${this.baseUrl}/api/blog/${encodeURIComponent(slug)}`, {
      ...options,
      headers: { ...options.headers, ...this.tenantHeaders() },
    });

    // 400 = el slug no cumple el formato aceptado por la API. Desde el visitante es una URL
    // que no existe, así que es un 404 y no un error (mismo criterio que ApiPageRepository).
    if (response.status === 404 || response.status === 400) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch blog post "${slug}": HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    return BlogPostResponseSchema.parse(payload).post;
  }
}
