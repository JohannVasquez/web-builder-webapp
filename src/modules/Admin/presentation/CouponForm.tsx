'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { refreshAsyncData } from '@/shared/lib/useAsyncData';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  endOfLocalDayIso,
  isValidCouponPercentage,
  startOfLocalDayIso,
  toLocalDateInput,
} from '../application/storePresentation';
import { CouponResponseSchema, type Coupon } from '../domain/StoreApi';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export interface CouponFormProps {
  readonly tenantId: number;
  readonly coupon: Coupon | null;
  readonly onClose: () => void;
}

const COUPONS_CACHE_KEY = (tenantId: number): string => `admin:coupons:${tenantId}`;

export function CouponForm({ tenantId, coupon, onClose }: CouponFormProps): ReactElement {
  const api = useAdminApi();
  const isEditing = coupon !== null;

  const [code, setCode] = useState(coupon?.code ?? '');
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>(
    coupon?.discountType ?? 'percentage',
  );
  const [value, setValue] = useState(coupon?.value.toString() ?? '');
  const [minimumCents, setMinimumCents] = useState(
    coupon?.minimumCents?.toString() ?? '',
  );
  const [startsAt, setStartsAt] = useState(toLocalDateInput(coupon?.startsAt ?? null));
  const [endsAt, setEndsAt] = useState(toLocalDateInput(coupon?.endsAt ?? null));
  const [maxUses, setMaxUses] = useState(coupon?.maxUses?.toString() ?? '');
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      setFormError('El valor del descuento debe ser un número.');
      return;
    }

    if (!isValidCouponPercentage(discountType, parsedValue)) {
      setFormError('El porcentaje de descuento no puede ser mayor a 100.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      code,
      discountType,
      value: parsedValue,
      minimumCents: minimumCents === '' ? null : parseInt(minimumCents, 10),
      startsAt: startOfLocalDayIso(startsAt),
      endsAt: endOfLocalDayIso(endsAt),
      maxUses: maxUses === '' ? null : parseInt(maxUses, 10),
      isActive,
    };

    try {
      if (isEditing) {
        await api.patch(
          `/api/admin/tenants/${tenantId}/store/coupons/${coupon.id}`,
          payload,
          CouponResponseSchema,
        );
        toast.success('Cupón actualizado.');
      } else {
        await api.post(
          `/api/admin/tenants/${tenantId}/store/coupons`,
          payload,
          CouponResponseSchema,
        );
        toast.success('Cupón creado.');
      }
      refreshAsyncData(COUPONS_CACHE_KEY(tenantId));
      onClose();
    } catch (err) {
      const errorData = describeAdminError(err, 'Error al guardar el cupón.');
      setFormError(
        errorData.message +
          (errorData.issues.length > 0
            ? ': ' + errorData.issues.map((i) => i.message).join(', ')
            : ''),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-lg rounded-lg border shadow-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Cupón' : 'Crear Cupón'}
          </h2>
          <Button aria-label="Cerrar el formulario del cupón" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            ✕
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="p-4 overflow-y-auto space-y-4"
        >
          {formError !== null && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Código del cupón</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="VERANO2024"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Tipo de descuento</Label>
              <select
                id="discountType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as 'percentage' | 'amount')
                }
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="amount">Monto ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumCents">Compra mínima en pesos (opcional)</Label>
            <Input
              id="minimumCents"
              type="number"
              value={minimumCents}
              onChange={(e) => setMinimumCents(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Desde (opcional)</Label>
              <Input
                id="startsAt"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Hasta (opcional)</Label>
              <Input
                id="endsAt"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Usos máximos (opcional)</Label>
              <Input
                id="maxUses"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor="isActive">Activo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
