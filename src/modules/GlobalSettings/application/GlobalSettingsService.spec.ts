import { GlobalSettingsService } from './GlobalSettingsService';
import { DEFAULT_GLOBAL_SETTINGS, type GlobalSettings } from '../domain/GlobalSettings';
import type { GlobalSettingsRepository } from '../domain/GlobalSettingsRepository';

describe('GlobalSettingsService', () => {
  const settings: GlobalSettings = {
    ...DEFAULT_GLOBAL_SETTINGS,
    siteName: 'Web Builder Co.',
    whatsappNumber: '56912345678',
  };

  it('returns the settings from the repository', async () => {
    const repository: jest.Mocked<GlobalSettingsRepository> = {
      find: jest.fn().mockResolvedValue(settings),
    };
    const service = new GlobalSettingsService(repository);

    const result = await service.getSettings();

    expect(result).toEqual(settings);
  });

  it('falls back to defaults when the repository fails', async () => {
    const repository: jest.Mocked<GlobalSettingsRepository> = {
      find: jest.fn().mockRejectedValue(new Error('API down')),
    };
    const service = new GlobalSettingsService(repository);

    const result = await service.getSettings();

    expect(result).toEqual(DEFAULT_GLOBAL_SETTINGS);
  });
});
