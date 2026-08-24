import { GlobalSettingsSchema, type GlobalSettings } from '../domain/GlobalSettings';
import type { GlobalSettingsRepository } from '../domain/GlobalSettingsRepository';

import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';

export class ApiGlobalSettingsRepository implements GlobalSettingsRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantDomain?: string,
  ) {}

  public async find(): Promise<GlobalSettings> {
    const response = await fetch(`${this.baseUrl}/api/settings`, {
      cache: 'no-store',
      headers:
        this.tenantDomain === undefined
          ? undefined
          : { [TENANT_DOMAIN_HEADER]: this.tenantDomain },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch global settings: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return GlobalSettingsSchema.parse(payload);
  }
}
