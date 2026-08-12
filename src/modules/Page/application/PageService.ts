import type { Page } from '../domain/Page';
import type { PageRepository } from '../domain/PageRepository';

export class PageService {
  constructor(private readonly pageRepository: PageRepository) {}

  public async getPage(slug: string): Promise<Page | null> {
    return this.pageRepository.findBySlug(slug);
  }
}
