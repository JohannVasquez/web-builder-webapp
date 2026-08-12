import { GlobalSettingsSchema, type GlobalSettings } from '../domain/GlobalSettings';
import type { GlobalSettingsRepository } from '../domain/GlobalSettingsRepository';

export class ApiGlobalSettingsRepository implements GlobalSettingsRepository {
  constructor(private readonly baseUrl: string) {}

  public async find(): Promise<GlobalSettings> {
    const response = await fetch(`${this.baseUrl}/api/settings`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch global settings: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return GlobalSettingsSchema.parse(payload);
  }
}
