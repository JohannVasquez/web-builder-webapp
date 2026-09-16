import type { Page, PublishedPageSummary } from './Page';

export interface PageRepository {
  findBySlug(slug: string): Promise<Page | null>;
  findAllPublished(): Promise<PublishedPageSummary[]>;
}
