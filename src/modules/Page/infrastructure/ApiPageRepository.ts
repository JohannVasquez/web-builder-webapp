import { PageSchema, type Page } from '../domain/Page';
import type { PageRepository } from '../domain/PageRepository';

import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';

export class ApiPageRepository implements PageRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantDomain?: string,
  ) {}

  public async findBySlug(slug: string): Promise<Page | null> {
    const response = await fetch(
      `${this.baseUrl}/api/pages/${encodeURIComponent(slug)}`,
      {
        cache: 'no-store',
        headers:
          this.tenantDomain === undefined
            ? undefined
            : { [TENANT_DOMAIN_HEADER]: this.tenantDomain },
      },
    );

    // 400 = el slug no cumple el formato que acepta la API (kebab-case de un
    // solo segmento). Desde el punto de vista del visitante eso es una URL que
    // no existe, así que es un 404 y no un error: sin esto, cualquier URL
    // inventada con barras o mayúsculas reventaba la página con un 500.
    if (response.status === 404 || response.status === 400) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch page "${slug}": HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    return PageSchema.parse(payload);
  }
}
