import type { BlogListResponse, BlogPostDetail } from './BlogPost';

export interface BlogListParams {
  readonly page: number;
  readonly perPage: number;
  readonly tag?: string;
}

export interface BlogRepository {
  listPosts(params: BlogListParams): Promise<BlogListResponse>;
  findBySlug(slug: string): Promise<BlogPostDetail | null>;
}
