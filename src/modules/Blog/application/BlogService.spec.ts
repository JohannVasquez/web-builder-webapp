import { BlogService } from './BlogService';
import type { BlogListResponse, BlogPostDetail } from '../domain/BlogPost';
import type { BlogRepository } from '../domain/BlogRepository';

describe('BlogService', () => {
  const listResponse: BlogListResponse = { posts: [], total: 0, page: 1, perPage: 3 };

  it('delegates listPosts to the repository', async () => {
    const repository: jest.Mocked<BlogRepository> = {
      listPosts: jest.fn().mockResolvedValue(listResponse),
      findBySlug: jest.fn().mockResolvedValue(null),
    };
    const service = new BlogService(repository);

    const result = await service.listPosts({ page: 1, perPage: 3 });

    expect(repository.listPosts).toHaveBeenCalledWith({ page: 1, perPage: 3 });
    expect(result).toEqual(listResponse);
  });

  it('returns an empty list instead of throwing when the API is down', async () => {
    const repository: jest.Mocked<BlogRepository> = {
      listPosts: jest.fn().mockRejectedValue(new Error('HTTP 500')),
      findBySlug: jest.fn(),
    };
    const service = new BlogService(repository);

    const result = await service.listPosts({ page: 2, perPage: 5 });

    expect(result).toEqual({ posts: [], total: 0, page: 2, perPage: 5 });
  });

  it('returns the post from the repository', async () => {
    const post = { slug: 'post-publicado' } as unknown as BlogPostDetail;
    const repository: jest.Mocked<BlogRepository> = {
      listPosts: jest.fn(),
      findBySlug: jest.fn().mockResolvedValue(post),
    };
    const service = new BlogService(repository);

    const result = await service.getPost('post-publicado');

    expect(result).toBe(post);
  });

  it('returns null instead of throwing when the API is down', async () => {
    const repository: jest.Mocked<BlogRepository> = {
      listPosts: jest.fn(),
      findBySlug: jest.fn().mockRejectedValue(new Error('HTTP 500')),
    };
    const service = new BlogService(repository);

    const result = await service.getPost('post-publicado');

    expect(result).toBeNull();
  });
});
