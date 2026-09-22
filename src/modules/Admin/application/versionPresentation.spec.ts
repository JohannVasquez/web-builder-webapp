import {
  describeVersion,
  describeVersionActor,
  isCurrentVersion,
  type PageVersionView,
} from './versionPresentation';

describe('versionPresentation', () => {
  const version = (overrides: Partial<PageVersionView> = {}): PageVersionView => ({
    id: '018f6f1a-0000-7000-8000-000000000001',
    summary: 'Editó un bloque',
    actorType: 'admin',
    actorName: 'Johann',
    createdAt: '2026-09-17T10:02:17.195Z',
    ...overrides,
  });

  it('marca al agente para poder distinguirlo de una persona', () => {
    expect(describeVersionActor(version({ actorType: 'apiKey', actorName: 'Agente MCP' }))).toBe(
      'Agente MCP (agente)',
    );
  });

  it('deja el nombre tal cual cuando fue una persona', () => {
    expect(describeVersionActor(version())).toBe('Johann');
  });

  it('arma una línea con qué pasó, quién y cuándo', () => {
    const line = describeVersion(version());

    expect(line).toContain('Editó un bloque');
    expect(line).toContain('Johann');
    expect(line).toContain('2026');
  });

  it('la primera de la lista es el estado actual', () => {
    expect(isCurrentVersion(0)).toBe(true);
    expect(isCurrentVersion(1)).toBe(false);
  });
});
