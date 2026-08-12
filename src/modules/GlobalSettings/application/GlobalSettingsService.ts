import { DEFAULT_GLOBAL_SETTINGS, type GlobalSettings } from '../domain/GlobalSettings';
import type { GlobalSettingsRepository } from '../domain/GlobalSettingsRepository';

export class GlobalSettingsService {
  constructor(private readonly repository: GlobalSettingsRepository) {}

  /**
   * Devuelve las variables globales de marca. Si la API no está disponible,
   * entrega valores por defecto para que el layout siga renderizando.
   */
  public async getSettings(): Promise<GlobalSettings> {
    try {
      return await this.repository.find();
    } catch {
      return DEFAULT_GLOBAL_SETTINGS;
    }
  }
}
