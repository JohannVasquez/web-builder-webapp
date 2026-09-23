import type { BlogListResponse, BlogPostDetail } from '../domain/BlogPost';
import type { BlogListParams, BlogRepository } from '../domain/BlogRepository';

const EMPTY_LIST = (params: BlogListParams): BlogListResponse => ({
  posts: [],
  total: 0,
  page: params.page,
  perPage: params.perPage,
});

export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}

  // Una lista vacía es mejor que tumbar el sitio: el bloque "Últimas publicaciones" y el
  // listado del blog deben poder mostrarse (vacíos) aunque la API del blog esté caída.
  public async listPosts(params: BlogListParams): Promise<BlogListResponse> {
    try {
      return await this.blogRepository.listPosts(params);
    } catch {
      return EMPTY_LIST(params);
    }
  }

  // Igual que arriba: si la API falla, se trata como "no existe" en vez de un error 500.
  public async getPost(slug: string): Promise<BlogPostDetail | null> {
    try {
      return await this.blogRepository.findBySlug(slug);
    } catch {
      return null;
    }
  }
}
