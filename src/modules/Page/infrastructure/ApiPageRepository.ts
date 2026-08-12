import { PageSchema, type Page } from '../domain/Page';
import type { PageRepository } from '../domain/PageRepository';

export class ApiPageRepository implements PageRepository {
  constructor(private readonly baseUrl: string) {}

  public async findBySlug(slug: string): Promise<Page | null> {
    const response = await fetch(
      `${this.baseUrl}/api/pages/${encodeURIComponent(slug)}`,
      { cache: 'no-store' },
    );

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch page "${slug}": HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    return PageSchema.parse(payload);
  }
}
