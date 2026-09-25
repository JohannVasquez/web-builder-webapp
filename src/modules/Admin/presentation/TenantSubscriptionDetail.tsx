'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Clock, Loader2, Save } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { describeAdminError } from '../application/adminErrorMessage';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { SubscriptionStatusResponseSchema, type SubscriptionStatus } from '../domain/AdminApi';
import { z } from 'zod';

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

interface Props {
  readonly tenantId: string;
}

export function TenantSubscriptionDetail({ tenantId }: Props): ReactElement | null {
  const api = useAdminApi();
  const cacheKey = `admin:tenant:${tenantId}:subscription`;
  
  const { data, isLoading, error } = useAsyncData(
    cacheKey,
    () => api.get(`/api/admin/tenants/${tenantId}/subscription`, SubscriptionStatusResponseSchema).catch(e => {
      // Si el status es 404, significa que no hay suscripción, no deberíamos crashear.
      // Pero el caso de uso devuelve 404 NotFoundError.
      throw e;
    })
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState('');

  if (isLoading) {
    return <div className="ui-card p-6 flex justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>;
  }

  // Si no hay suscripción o hay error, preferimos no mostrar nada o un error sutil.
  if (error !== null || data === null) {
    return null;
  }

  const handleRegisterPayment = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!amount || !date || !method) {
      toast.error('Completa todos los campos del pago.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/admin/tenants/${tenantId}/subscription/payments`, {
        amountCents: parseInt(amount, 10),
        paidAt: new Date(date).toISOString(),
        paymentMethod: method,
      }, z.any());
      
      toast.success('Pago registrado.');
      setAmount('');
      setDate('');
      setMethod('');
      refreshAsyncData(cacheKey);
      refreshAsyncData('admin:subscriptions-overview');
    } catch (err) {
      toast.error(describeAdminError(err, 'No pudimos registrar el pago.').message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatClp = (cents: number): string => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(cents);

  const StatusIcon = STATUS_ICONS[data.status];

  return (
    <div className="ui-card p-6 space-y-6">
      <div>
        <h3 className="ui-heading text-lg">Suscripción y Cobro</h3>
        <p className="text-muted-foreground text-sm">Gestiona la mensualidad de este cliente.</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Plan</p>
          <p className="font-medium">{data.planName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Monto</p>
          <p className="font-medium tabular-nums">{formatClp(data.priceCents)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Estado</p>
          <div className={`flex items-center gap-1.5 ${STATUS_CLASSES[data.status]}`}>
            <StatusIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">{STATUS_TEXT[data.status]}</span>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <form onSubmit={(e) => void handleRegisterPayment(e)} className="space-y-4">
        <h4 className="font-medium">Registrar pago recibido</h4>
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Monto (CLP)</Label>
            <Input
              id="payment-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 30000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-date">Fecha</Label>
            <Input
              id="payment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-method">Medio (ej: Transferencia)</Label>
            <Input
              id="payment-method"
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Transferencia"
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Registrar pago
          </Button>
        </div>
      </form>
    </div>
  );
}
