'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import {
  CouponListResponseSchema,
  CouponResponseSchema,
  type Coupon,
} from '../domain/StoreApi';
import { formatMoney } from '../application/storePresentation';
import { Button } from '@/shared/ui/button';
import { CouponForm } from './CouponForm';

export interface CouponManagerProps {
  readonly tenantId: number;
}

const COUPONS_CACHE_KEY = (tenantId: number): string => `admin:coupons:${tenantId}`;

export const CouponManager = ({
  tenantId,
}: CouponManagerProps): import('react').ReactElement | null => {
  const api = useAdminApi();
  const { data, isLoading, error } = useAsyncData(COUPONS_CACHE_KEY(tenantId), () =>
    api.get(`/api/admin/tenants/${tenantId}/store/coupons`, CouponListResponseSchema),
  );

  const [saving, setSaving] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<{
    id: string;
    coupon: Coupon | null;
  } | null>(null);

  const handleDelete = async (coupon: Coupon): Promise<void> => {
    if (!window.confirm(`¿Seguro que deseas eliminar el cupón "${coupon.code}"?`)) {
      return;
    }
    setSaving(true);
    try {
      await api.remove(`/api/admin/tenants/${tenantId}/store/coupons/${coupon.id}`);
      toast.success('Cupón eliminado.');
      refreshAsyncData(COUPONS_CACHE_KEY(tenantId));
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al eliminar cupón.').message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon): Promise<void> => {
    setSaving(true);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/store/coupons/${coupon.id}`,
        { isActive: !coupon.isActive },
        CouponResponseSchema,
      );
      toast.success(`Cupón ${!coupon.isActive ? 'activado' : 'desactivado'}.`);
      refreshAsyncData(COUPONS_CACHE_KEY(tenantId));
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al cambiar estado del cupón.').message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        {error ?? 'Error al cargar cupones.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Cupones de descuento</h3>
        <Button
          onClick={() => setEditingCoupon({ id: 'new', coupon: null })}
          disabled={saving}
        >
          <Plus className="mr-2 h-4 w-4" /> Crear Cupón
        </Button>
      </div>

      {data.coupons.length === 0 ? (
        <p className="text-muted-foreground">No hay cupones creados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`border rounded-lg p-4 bg-card flex flex-col gap-2 ${!coupon.isActive ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-xl uppercase tracking-wider">
                  {coupon.code}
                </h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      void handleToggleActive(coupon);
                    }}
                    disabled={saving}
                    title={coupon.isActive ? 'Desactivar' : 'Activar'}
                    aria-label={`${coupon.isActive ? 'Desactivar' : 'Activar'} el cupón ${coupon.code}`}
                  >
                    {coupon.isActive ? (
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Power className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCoupon({ id: coupon.id.toString(), coupon })}
                    disabled={saving}
                    aria-label={`Editar el cupón ${coupon.code}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      void handleDelete(coupon);
                    }}
                    disabled={saving}
                    aria-label={`Eliminar el cupón ${coupon.code}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="text-sm">
                Descuento:{' '}
                <span className="font-semibold">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.value}%`
                    : formatMoney(coupon.value, 'CLP')}
                </span>
              </div>
              {coupon.minimumCents !== null && (
                <div className="text-sm text-muted-foreground">
                  Mínimo compra: {formatMoney(coupon.minimumCents, 'CLP')}
                </div>
              )}

              <div className="mt-2 text-xs text-muted-foreground">
                <p>
                  Usados: {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                </p>
                {coupon.startsAt && (
                  <p>Desde: {new Date(coupon.startsAt).toLocaleDateString('es-CL')}</p>
                )}
                {coupon.endsAt && (
                  <p>Hasta: {new Date(coupon.endsAt).toLocaleDateString('es-CL')}</p>
                )}
              </div>

              {!coupon.isActive && (
                <span className="mt-2 inline-flex self-start bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs font-medium">
                  Inactivo
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {editingCoupon && (
        <CouponForm
          key={editingCoupon.id}
          tenantId={tenantId}
          coupon={editingCoupon.coupon}
          onClose={() => setEditingCoupon(null)}
        />
      )}
    </div>
  );
};
