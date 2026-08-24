import { NavigationSchema, type NavigationLink } from '../domain/NavigationLink';
import type { NavigationRepository } from '../domain/NavigationRepository';

import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';

export class ApiNavigationRepository implements NavigationRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantDomain?: string,
  ) {}

  public async findAll(): Promise<NavigationLink[]> {
    const response = await fetch(`${this.baseUrl}/api/navigation`, {
      cache: 'no-store',
      headers:
        this.tenantDomain === undefined
          ? undefined
          : { [TENANT_DOMAIN_HEADER]: this.tenantDomain },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch navigation: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return NavigationSchema.parse(payload);
  }
}
