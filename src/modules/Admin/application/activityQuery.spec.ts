import {
  ACTIVITY_PAGE_SIZE,
  EMPTY_ACTIVITY_FILTERS,
  buildActivityQuery,
  nextOffset,
  paginationFor,
  previousOffset,
} from './activityQuery';

describe('buildActivityQuery', () => {
  it('solo incluye limit y offset cuando no hay filtros', () => {
    expect(buildActivityQuery(EMPTY_ACTIVITY_FILTERS, 0)).toEqual({
      limit: String(ACTIVITY_PAGE_SIZE),
      offset: '0',
    });
  });

  it('agrega cada filtro que tiene valor', () => {
    const query = buildActivityQuery(
      { tenantId: 7, actorType: 'apiKey', from: '2026-01-01', to: '2026-01-31' },
      100,
    );
    expect(query).toEqual({
      limit: String(ACTIVITY_PAGE_SIZE),
      offset: '100',
      tenantId: '7',
      actorType: 'apiKey',
      from: '2026-01-01',
      to: '2026-01-31',
    });
  });

  it('ignora un rango de fechas vacío', () => {
    const query = buildActivityQuery({ ...EMPTY_ACTIVITY_FILTERS, from: '', to: '' }, 0);
    expect(query.from).toBeUndefined();
    expect(query.to).toBeUndefined();
  });
});

describe('paginationFor', () => {
  it('calcula la página y el total de páginas', () => {
    expect(paginationFor(100, 240)).toEqual({
      offset: 100,
      total: 240,
      page: 3,
      pageCount: 5,
      hasPrevious: true,
      hasNext: true,
    });
  });

  it('no ofrece "siguiente" en la última página', () => {
    expect(paginationFor(200, 240).hasNext).toBe(false);
  });

  it('no ofrece "anterior" en la primera página', () => {
    expect(paginationFor(0, 240).hasPrevious).toBe(false);
  });

  it('trata un total en cero como una sola página vacía', () => {
    expect(paginationFor(0, 0)).toEqual({
      offset: 0,
      total: 0,
      page: 1,
      pageCount: 1,
      hasPrevious: false,
      hasNext: false,
    });
  });
});

describe('previousOffset', () => {
  it('retrocede una página', () => {
    expect(previousOffset(100)).toBe(50);
  });

  it('nunca baja de cero', () => {
    expect(previousOffset(20)).toBe(0);
  });
});

describe('nextOffset', () => {
  it('avanza una página cuando quedan resultados', () => {
    expect(nextOffset(0, 120)).toBe(ACTIVITY_PAGE_SIZE);
  });

  it('no se pasa de la última página', () => {
    expect(nextOffset(100, 120)).toBe(100);
  });

  it('se queda quieto si ya está en la última página exacta', () => {
    expect(nextOffset(50, 100)).toBe(50);
  });
});
