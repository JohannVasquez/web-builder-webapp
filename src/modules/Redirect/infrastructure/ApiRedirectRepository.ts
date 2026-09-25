import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import { RedirectSchema, type Redirect } from '../domain/Redirect';
import type { RedirectRepository } from '../domain/RedirectRepository';
import { siteCacheOptions } from '@/shared/lib/cacheTags';

export class ApiRedirectRepository implements RedirectRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantDomain: string,
  ) {}

  public async resolve(path: string): Promise<Redirect | null> {
    const response = await fetch(
      `${this.baseUrl}/api/redirecciones?path=${encodeURIComponent(path)}`,
      {
        ...siteCacheOptions(this.tenantDomain),
        headers: { [TENANT_DOMAIN_HEADER]: this.tenantDomain },
      },
    );

    if (response.status === 404 || response.status === 400) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to resolve redirect for "${path}": HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' || !('redirect' in payload) || payload.redirect === null) {
      return null;
    }
    return RedirectSchema.parse(payload.redirect);
  }
}
