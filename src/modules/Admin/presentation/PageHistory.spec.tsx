import { renderToStaticMarkup } from 'react-dom/server';
import { VersionList } from './PageHistory';
import type { PageVersion } from '../domain/AdminApi';

describe('VersionList', () => {
  const version = (overrides: Partial<PageVersion> = {}): PageVersion => ({
    id: 1,
    summary: 'Editó un bloque',
    actorType: 'admin',
    actorName: 'Johann',
    published: false,
    createdAt: '2026-09-17T10:02:17.195Z',
    ...overrides,
  });

  const render = (versions: PageVersion[]): string =>
    renderToStaticMarkup(
      <VersionList versions={versions} isBusy={false} onRestore={() => undefined} />,
    );

  it('explica que no hay nada en vez de mostrar una lista vacía', () => {
    expect(render([])).toContain('Todavía no hay cambios guardados');
  });

  it('no ofrece restaurar el estado actual', () => {
    const html = render([version()]);

    expect(html).toContain('estado actual');
    expect(html).not.toContain('Restaurar');
  });

  it('ofrece restaurar las versiones anteriores', () => {
    const html = render([version(), version({ id: 2, summary: 'Agregó el bloque Hero' })]);

    expect(html).toContain('Restaurar');
    expect(html).toContain('Agregó el bloque Hero');
  });

  it('marca cuando el cambio lo hizo un agente', () => {
    const html = render([
      version(),
      version({ id: 2, actorType: 'apiKey', actorName: 'Agente MCP' }),
    ]);

    expect(html).toContain('Agente MCP (agente)');
  });
});
