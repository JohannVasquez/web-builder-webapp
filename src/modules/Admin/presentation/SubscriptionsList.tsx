'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Clock, Download, Loader2, Search } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { describeAdminError } from '../application/adminErrorMessage';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { SubscriptionOverviewResponseSchema, type SubscriptionStatus } from '../domain/AdminApi';

const STATUS_ICONS: Record<SubscriptionStatus, typeof CheckCircle2> = {
  al_dia: CheckCircle2,
  por_vencer: Clock,
  atrasado: AlertCircle,
};

const STATUS_TEXT: Record<SubscriptionStatus, string> = {
  al_dia: 'Al día',
  por_vencer: 'Por vencer',
  atrasado: 'Atrasado',
};

const STATUS_CLASSES: Record<SubscriptionStatus, string> = {
  al_dia: 'text-emerald-600 dark:text-emerald-400',
  por_vencer: 'text-amber-600 dark:text-amber-400',
  atrasado: 'text-red-600 dark:text-red-400 font-medium',
};

export function SubscriptionsList(): ReactElement {
  const api = useAdminApi();
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useAsyncData('admin:subscriptions-overview', () => api.get('/api/admin/subscriptions', SubscriptionOverviewResponseSchema));

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const blob = await api.downloadCsv('/api/admin/subscriptions/export');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscriptions.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(describeAdminError(e, 'Error al exportar.').message);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  if (error !== null || data === null) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        {error !== null ? error : 'Error al cargar los cobros'}
      </div>
    );
  }

  const query = search.toLowerCase();
  const filteredRows = data.rows.filter((row) =>
    row.planName.toLowerCase().includes(query) || row.tenantId.toLowerCase().includes(query)
  );

  const formatClp = (cents: number): string => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(cents);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="ui-heading text-2xl">Cobro Mensual</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ingreso mensual comprometido: <strong className="text-foreground">{formatClp(data.totalMrrCents)}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 size-4" />
            <Input
              type="search"
              placeholder="Buscar cliente o plan..."
              value={search}
              onChange={(e) => void setSearch(e.target.value)}
              className="w-full pl-9 sm:w-64"
            />
          </div>
          <Button onClick={() => void handleExport()} disabled={isExporting} variant="outline" className="shrink-0 gap-2">
            {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs font-medium">
              <tr>
                <th className="px-4 py-3">Cliente (ID)</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Aporte al MRR</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted-foreground p-8 text-center">
                    No hay clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const StatusIcon = STATUS_ICONS[row.status];
                  return (
                    <tr key={row.tenantId} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/admin/clientes/${row.tenantId}`} className="hover:underline">
                          {row.tenantId}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.planName}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatClp(row.priceCents)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatClp(row.mrrCents)}</td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1.5 ${STATUS_CLASSES[row.status]}`}>
                          <StatusIcon className="size-4 shrink-0" aria-hidden="true" />
                          <span>{STATUS_TEXT[row.status]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/clientes/${row.tenantId}`}>
                            Gestionar
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
