'use client';

import { useState, type ReactElement } from 'react';
import { Loader2, User, KeySquare } from 'lucide-react';
import { ActivitySchema, TenantsSchema } from '../domain/AdminApi';
import {
  EMPTY_ACTIVITY_FILTERS,
  buildActivityQuery,
  nextOffset,
  paginationFor,
  previousOffset,
  type ActivityFilters,
} from '../application/activityQuery';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';

const TENANTS_CACHE_KEY = 'admin:tenants';

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });

export function ActivityLog(): ReactElement {
  const api = useAdminApi();
  const tenants = useAsyncData(TENANTS_CACHE_KEY, async () => {
    const { tenants: list } = await api.get('/api/admin/tenants', TenantsSchema);
    return list;
  });

  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_ACTIVITY_FILTERS);
  const [offset, setOffset] = useState(0);

  const cacheKey = `admin:activity:${JSON.stringify(filters)}:${String(offset)}`;
  const activity = useAsyncData(cacheKey, async () => {
    const query = buildActivityQuery(filters, offset);
    return api.get(
      `/api/admin/activity?${new URLSearchParams(query).toString()}`,
      ActivitySchema,
    );
  });

  const tenantList = tenants.data ?? [];
  const tenantNameById = new Map(tenantList.map((tenant) => [tenant.id, tenant.name]));

  const updateFilters = (patch: Partial<ActivityFilters>): void => {
    setFilters((current) => ({ ...current, ...patch }));
    setOffset(0);
  };

  const pagination =
    activity.data !== null ? paginationFor(offset, activity.data.total) : null;

  return (
    <div className="space-y-6">
      <h1 className="ui-heading text-2xl">Actividad</h1>

      <div className="ui-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="activity-tenant">Cliente</Label>
          <select
            id="activity-tenant"
            className="ui-input h-9 w-full px-3 text-sm"
            value={filters.tenantId ?? ''}
            onChange={(event) =>
              updateFilters({
                tenantId: event.target.value === '' ? null : event.target.value,
              })
            }
          >
            <option value="">Todos</option>
            {tenantList.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity-actor-type">Tipo de actor</Label>
          <select
            id="activity-actor-type"
            className="ui-input h-9 w-full px-3 text-sm"
            value={filters.actorType ?? ''}
            onChange={(event) =>
              updateFilters({
                actorType:
                  event.target.value === ''
                    ? null
                    : (event.target.value as 'admin' | 'apiKey'),
              })
            }
          >
            <option value="">Todos</option>
            <option value="admin">Persona</option>
            <option value="apiKey">Clave de agente</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity-from">Desde</Label>
          <input
            id="activity-from"
            type="date"
            className="ui-input h-9 w-full px-3 text-sm"
            value={filters.from}
            onChange={(event) => updateFilters({ from: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity-to">Hasta</Label>
          <input
            id="activity-to"
            type="date"
            className="ui-input h-9 w-full px-3 text-sm"
            value={filters.to}
            onChange={(event) => updateFilters({ to: event.target.value })}
          />
        </div>
      </div>

      {activity.error !== null && (
        <p role="alert" className="text-destructive">
          {activity.error}
        </p>
      )}

      {activity.error === null && (activity.isLoading || activity.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando actividad...
        </p>
      )}

      {activity.data !== null && activity.data.entries.length === 0 && (
        <p className="text-muted-foreground">
          No hay actividad registrada para estos filtros. Prueba a ampliar el rango de
          fechas o quitar algún filtro.
        </p>
      )}

      {activity.data !== null && activity.data.entries.length > 0 && (
        <div className="ui-card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted-foreground border-b text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Acción</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Resumen</th>
              </tr>
            </thead>
            <tbody>
              {activity.data.entries.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      {entry.actorType === 'admin' ? (
                        <User
                          className="text-muted-foreground size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <KeySquare
                          className="text-muted-foreground size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {entry.actorName}
                    </span>
                  </td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3">
                    {entry.tenantId === null
                      ? '—'
                      : (tenantNameById.get(entry.tenantId) ?? 'Cliente eliminado')}
                  </td>
                  <td className="px-4 py-3">{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination !== null &&
        activity.data !== null &&
        activity.data.entries.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              Página {pagination.page} de {pagination.pageCount} — {pagination.total}{' '}
              registros
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevious}
                onClick={() => setOffset((current) => previousOffset(current))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() =>
                  setOffset((current) => nextOffset(current, pagination.total))
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
