export const ACTIVITY_PAGE_SIZE = 50;

export interface ActivityFilters {
  readonly tenantId: string | null;
  readonly actorType: 'admin' | 'apiKey' | null;
  readonly from: string;
  readonly to: string;
}

export const EMPTY_ACTIVITY_FILTERS: ActivityFilters = {
  tenantId: null,
  actorType: null,
  from: '',
  to: '',
};

// Solo entra el filtro que tiene valor: la API no debería recibir `tenantId=` vacío.
export const buildActivityQuery = (
  filters: ActivityFilters,
  offset: number,
): Record<string, string> => {
  const query: Record<string, string> = {
    limit: String(ACTIVITY_PAGE_SIZE),
    offset: String(offset),
  };
  if (filters.tenantId !== null) {
    query.tenantId = String(filters.tenantId);
  }
  if (filters.actorType !== null) {
    query.actorType = filters.actorType;
  }
  if (filters.from !== '') {
    query.from = filters.from;
  }
  if (filters.to !== '') {
    query.to = filters.to;
  }
  return query;
};

export interface ActivityPagination {
  readonly offset: number;
  readonly total: number;
  readonly page: number;
  readonly pageCount: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}

export const paginationFor = (offset: number, total: number): ActivityPagination => ({
  offset,
  total,
  page: Math.floor(offset / ACTIVITY_PAGE_SIZE) + 1,
  pageCount: Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE)),
  hasPrevious: offset > 0,
  hasNext: offset + ACTIVITY_PAGE_SIZE < total,
});

export const previousOffset = (offset: number): number =>
  Math.max(0, offset - ACTIVITY_PAGE_SIZE);

// Nunca deja avanzar la página a un offset que ya no tiene resultados.
export const nextOffset = (offset: number, total: number): number => {
  const proposed = offset + ACTIVITY_PAGE_SIZE;
  return proposed < total ? proposed : offset;
};
