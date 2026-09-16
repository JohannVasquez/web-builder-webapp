import type { Page, PublishedPageSummary } from '../domain/Page';
import type { PageRepository } from '../domain/PageRepository';

export class PageService {
  constructor(private readonly pageRepository: PageRepository) {}

  public async getPage(slug: string): Promise<Page | null> {
    return this.pageRepository.findBySlug(slug);
  }

  // Un sitemap vacío es mejor que una página de error si la API no responde.
  public async getPublishedPages(): Promise<PublishedPageSummary[]> {
    try {
      return await this.pageRepository.findAllPublished();
    } catch {
      return [];
    }
  }
}
