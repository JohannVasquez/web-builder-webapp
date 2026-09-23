'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { StoreReportResponseSchema } from '../domain/StoreApi';
import {
  browserTimeZone,
  endOfLocalDayIso,
  formatMoney,
  formatReportDay,
  startOfLocalDayIso,
} from '../application/storePresentation';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export interface SalesReportProps {
  readonly tenantId: string;
}

export const SalesReport = ({
  tenantId,
}: SalesReportProps): import('react').ReactElement | null => {
  const api = useAdminApi();

  // By default, empty strings will make API use last 30 days
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const url = new URL(`/api/admin/tenants/${tenantId}/store/report`, 'http://localhost');
  if (from) url.searchParams.set('from', startOfLocalDayIso(from) ?? from);
  if (to) url.searchParams.set('to', endOfLocalDayIso(to) ?? to);
  url.searchParams.set('timeZone', browserTimeZone());

  const cacheKey = `admin:report:${tenantId}:from=${from}:to=${to}`;

  const { data, isLoading, error } = useAsyncData(cacheKey, () =>
    api.get(url.pathname + url.search, StoreReportResponseSchema),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 border-b pb-4">
        <div className="space-y-1">
          <Label htmlFor="from">Desde</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to">Hasta</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
      )}

      {data && !isLoading && !error && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-md p-4 bg-card">
              <h4 className="text-sm text-muted-foreground font-medium">
                Ventas Totales
              </h4>
              <p className="text-2xl font-bold">
                {formatMoney(data.report.totalCents, 'CLP')}
              </p>
            </div>
            <div className="border rounded-md p-4 bg-card">
              <h4 className="text-sm text-muted-foreground font-medium">Pedidos</h4>
              <p className="text-2xl font-bold">{data.report.orders}</p>
            </div>
            <div className="border rounded-md p-4 bg-card">
              <h4 className="text-sm text-muted-foreground font-medium">
                Ticket Promedio
              </h4>
              <p className="text-2xl font-bold">
                {formatMoney(data.report.averageCents, 'CLP')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold border-b pb-2">Ventas por día</h4>
              {data.report.byDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay ventas en este período.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.report.byDay.map((day, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center text-sm border-b border-border/50 pb-2"
                    >
                      <span>{formatReportDay(day.date)}</span>
                      <div className="flex gap-4 text-right">
                        <span className="text-muted-foreground w-16">
                          {day.orders} ord.
                        </span>
                        <span className="font-semibold w-24">
                          {formatMoney(day.totalCents, 'CLP')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold border-b pb-2">Productos más vendidos</h4>
              {data.report.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay productos vendidos en este período.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.report.topProducts.map((p, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center text-sm border-b border-border/50 pb-2"
                    >
                      <span className="truncate pr-4">{p.name}</span>
                      <div className="flex gap-4 text-right">
                        <span className="text-muted-foreground w-16">{p.units} un.</span>
                        <span className="font-semibold w-24">
                          {formatMoney(p.totalCents, 'CLP')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
