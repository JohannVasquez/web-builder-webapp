import { ApiGlobalSettingsRepository } from './ApiGlobalSettingsRepository';
import { DEFAULT_GLOBAL_SETTINGS } from '../domain/GlobalSettings';

jest.mock('next/headers', () => ({
  draftMode: jest.fn().mockResolvedValue({ isEnabled: false }),
  cookies: jest.fn().mockResolvedValue({ get: () => undefined }),
}));

const { servedAsDemo: _servedAsDemo, ...BODY } = DEFAULT_GLOBAL_SETTINGS;

describe('ApiGlobalSettingsRepository', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('marca el sitio como demo cuando la API responde con X-Demo: true', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(Response.json(BODY, { headers: { 'X-Demo': 'true' } }));

    const settings = await new ApiGlobalSettingsRepository(
      'http://api',
      'demo-luna.cl',
    ).find();

    expect(settings.servedAsDemo).toBe(true);
  });

  it('sin el header no lo marca', async () => {
    global.fetch = jest.fn().mockResolvedValue(Response.json(BODY));

    const settings = await new ApiGlobalSettingsRepository(
      'http://api',
      'acme.cl',
    ).find();

    expect(settings.servedAsDemo).toBeUndefined();
  });
});
