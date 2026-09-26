import { GlobalSettingsSchema, type GlobalSettings } from '../domain/GlobalSettings';
import type { GlobalSettingsRepository } from '../domain/GlobalSettingsRepository';

import { DEMO_RESPONSE_HEADER } from '@/shared/config/demo';
import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import { siteCacheOptions } from '@/shared/lib/cacheTags';

export class ApiGlobalSettingsRepository implements GlobalSettingsRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantDomain?: string,
  ) {}

  public async find(): Promise<GlobalSettings> {
    const options = await siteCacheOptions(this.tenantDomain);
    const response = await fetch(`${this.baseUrl}/api/settings`, {
      ...options,
      headers: {
        ...options.headers,
        ...(this.tenantDomain === undefined
          ? {}
          : { [TENANT_DOMAIN_HEADER]: this.tenantDomain }),
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch global settings: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    const settings = GlobalSettingsSchema.parse(payload);
    return response.headers.get(DEMO_RESPONSE_HEADER) === 'true'
      ? { ...settings, servedAsDemo: true }
      : settings;
  }
}
