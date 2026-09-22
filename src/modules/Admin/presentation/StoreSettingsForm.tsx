'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import {
  StoreSettingsResponseSchema,
  type StoreSettings,
  type ShippingOption,
} from '../domain/StoreApi';

export interface StoreSettingsFormProps {
  readonly tenantId: number;
}

const SETTINGS_CACHE_KEY = (tenantId: number): string =>
  `admin:store-settings:${tenantId}`;

export const StoreSettingsForm = ({
  tenantId,
}: StoreSettingsFormProps): import('react').ReactElement | null => {
  const api = useAdminApi();
  const { data, isLoading, error } = useAsyncData(SETTINGS_CACHE_KEY(tenantId), () =>
    api.get(`/api/admin/tenants/${tenantId}/store/settings`, StoreSettingsResponseSchema),
  );

  // Local state for editing. Since we can't use useEffect to update state from data,
  // we either use a key on the form or just let the user edit. Wait, the rule is NO setState in useEffect.
  // We can use a pattern where we just have an uncontrolled form or update the key when data loads.

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
        {error ?? 'Error al cargar la configuración.'}
      </div>
    );
  }

  return (
    <SettingsEditor
      tenantId={tenantId}
      settings={data.store}
      onSaved={() => refreshAsyncData(SETTINGS_CACHE_KEY(tenantId))}
    />
  );
};

// Se separa en un subcomponente para poder inicializar el estado local (useState) con los datos
// que vienen de la API, sin violar la regla de no usar useEffect para sincronizar estado.
const SettingsEditor = ({
  tenantId,
  settings,
  onSaved,
}: {
  readonly tenantId: number;
  readonly settings: StoreSettings;
  readonly onSaved: () => void;
}): import('react').ReactElement | null => {
  const api = useAdminApi();
  const [saving, setSaving] = useState(false);
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxIncluded, setTaxIncluded] = useState(settings.taxIncluded);
  const [taxRatePercent, setTaxRatePercent] = useState(
    settings.taxRatePercent.toString(),
  );
  const [freeShippingThresholdCents, setFreeShippingThresholdCents] = useState(
    settings.freeShippingThresholdCents?.toString() ?? '',
  );
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(
    settings.shippingOptions,
  );
  const [paymentProvider, setPaymentProvider] = useState(settings.paymentProvider);
  const [notificationEmail, setNotificationEmail] = useState(
    settings.notificationEmail ?? '',
  );
  const [paymentCredentials, setPaymentCredentials] = useState<Record<string, string>>(
    {},
  );

  const handleAddShippingOption = (): void => {
    setShippingOptions([
      ...shippingOptions,
      { code: '', name: '', priceCents: 0, estimate: '', requiresAddress: true },
    ]);
  };

  const handleUpdateShippingOption = (index: number, option: ShippingOption): void => {
    const updated = [...shippingOptions];
    updated[index] = option;
    setShippingOptions(updated);
  };

  const handleRemoveShippingOption = (index: number): void => {
    setShippingOptions(shippingOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        isEnabled,
        currency,
        taxIncluded,
        taxRatePercent: parseFloat(taxRatePercent) || 0,
        freeShippingThresholdCents:
          freeShippingThresholdCents.trim() === ''
            ? null
            : parseInt(freeShippingThresholdCents, 10),
        shippingOptions: shippingOptions.map((option) => ({
          ...option,
          estimate:
            option.estimate === null || option.estimate.trim() === ''
              ? null
              : option.estimate.trim(),
        })),
        paymentProvider,
        notificationEmail:
          notificationEmail.trim() === '' ? null : notificationEmail.trim(),
        paymentCredentials:
          Object.keys(paymentCredentials).length > 0 ? paymentCredentials : undefined,
      };

      await api.patch(
        `/api/admin/tenants/${tenantId}/store/settings`,
        payload,
        StoreSettingsResponseSchema,
      );
      toast.success('Configuración guardada correctamente.');
      setPaymentCredentials({});
      onSaved();
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al guardar la configuración.').message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="space-y-6"
    >
      <div className="space-y-4 rounded-md border p-4">
        <h3 className="font-semibold text-lg">Estado de la tienda</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isEnabled"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          <Label htmlFor="isEnabled">Tienda encendida (visible para los clientes)</Label>
        </div>
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="font-semibold text-lg">Moneda e Impuestos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda (ej: CLP)</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRatePercent">Tasa de impuesto (%)</Label>
            <Input
              id="taxRatePercent"
              type="number"
              step="0.1"
              value={taxRatePercent}
              onChange={(e) => setTaxRatePercent(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              id="taxIncluded"
              checked={taxIncluded}
              onChange={(e) => setTaxIncluded(e.target.checked)}
            />
            <Label htmlFor="taxIncluded">Los precios ya incluyen impuesto</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="font-semibold text-lg">Notificaciones</h3>
        <div className="space-y-2">
          <Label htmlFor="notificationEmail">
            Correo electrónico para recibir avisos de nuevos pedidos
          </Label>
          <Input
            id="notificationEmail"
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Formas de envío</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddShippingOption}
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="freeShipping">
            Envío gratis desde (en pesos enteros, dejar vacío si no aplica)
          </Label>
          <Input
            id="freeShipping"
            type="number"
            value={freeShippingThresholdCents}
            onChange={(e) => setFreeShippingThresholdCents(e.target.value)}
          />
        </div>

        {shippingOptions.map((opt, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end border p-3 rounded-md"
          >
            <div className="space-y-1">
              <Label htmlFor={`shipping-${String(i)}-codigo`}>Código</Label>
              <Input
                id={`shipping-${String(i)}-codigo`}
                value={opt.code}
                onChange={(e) =>
                  handleUpdateShippingOption(i, { ...opt, code: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`shipping-${String(i)}-nombre`}>Nombre</Label>
              <Input
                id={`shipping-${String(i)}-nombre`}
                value={opt.name}
                onChange={(e) =>
                  handleUpdateShippingOption(i, { ...opt, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`shipping-${String(i)}-precio`}>Precio ($)</Label>
              <Input
                id={`shipping-${String(i)}-precio`}
                type="number"
                value={opt.priceCents}
                onChange={(e) =>
                  handleUpdateShippingOption(i, {
                    ...opt,
                    priceCents: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`shipping-${String(i)}-estimacion-ej-2-3-dias`}>
                Estimación (ej: 2-3 días)
              </Label>
              <Input
                id={`shipping-${String(i)}-estimacion-ej-2-3-dias`}
                value={opt.estimate}
                onChange={(e) =>
                  handleUpdateShippingOption(i, { ...opt, estimate: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="checkbox"
                  id={`shipping-${String(i)}-address`}
                  checked={opt.requiresAddress}
                  onChange={(e) =>
                    handleUpdateShippingOption(i, {
                      ...opt,
                      requiresAddress: e.target.checked,
                    })
                  }
                />
                <label htmlFor={`shipping-${String(i)}-address`} className="text-xs">
                  Pide dirección
                </label>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label={`Quitar la forma de envío ${opt.name === '' ? String(i + 1) : opt.name}`}
                onClick={() => handleRemoveShippingOption(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <h3 className="font-semibold text-lg">Medio de cobro</h3>
        <div className="space-y-2">
          <Label htmlFor="store-proveedor">Proveedor</Label>
          <select
            id="store-proveedor"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={paymentProvider}
            onChange={(e) =>
              setPaymentProvider(e.target.value as 'none' | 'transfer' | 'flow')
            }
          >
            <option value="none">Ninguno (apagado)</option>
            <option value="transfer">Transferencia bancaria manual</option>
            <option value="flow">Flow (Tarjetas/Webpay)</option>
          </select>
        </div>

        {paymentProvider !== 'none' && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            <h4 className="font-medium">
              Credenciales{' '}
              {settings.hasPaymentCredentials && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (Ya configuradas)
                </span>
              )}
            </h4>
            <p className="text-sm text-muted-foreground">
              Las credenciales se guardan de forma segura y nunca se devuelven al
              navegador. Completa estos campos sólo si necesitas cambiarlas.
            </p>

            {paymentProvider === 'transfer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-nombre-de-la-cuenta">Nombre de la cuenta</Label>
                  <Input
                    id="store-nombre-de-la-cuenta"
                    value={paymentCredentials.accountName ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        accountName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-rut">RUT</Label>
                  <Input
                    id="store-rut"
                    value={paymentCredentials.rut ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        rut: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-banco">Banco</Label>
                  <Input
                    id="store-banco"
                    value={paymentCredentials.bank ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        bank: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-tipo-de-cuenta-ej-corriente">
                    Tipo de cuenta (ej: Corriente)
                  </Label>
                  <Input
                    id="store-tipo-de-cuenta-ej-corriente"
                    value={paymentCredentials.accountType ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        accountType: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-numero-de-cuenta">Número de cuenta</Label>
                  <Input
                    id="store-numero-de-cuenta"
                    value={paymentCredentials.accountNumber ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-correo-para-comprobantes">
                    Correo para comprobantes
                  </Label>
                  <Input
                    id="store-correo-para-comprobantes"
                    type="email"
                    value={paymentCredentials.email ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {paymentProvider === 'flow' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-modo">Modo</Label>
                  <select
                    id="store-modo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={paymentCredentials.mode ?? 'sandbox'}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        mode: e.target.value,
                      })
                    }
                  >
                    <option value="sandbox">Sandbox (pruebas, no cobra de verdad)</option>
                    <option value="production">Producción</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-api-key">API Key</Label>
                  <Input
                    id="store-api-key"
                    value={paymentCredentials.apiKey ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        apiKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-secret-key">Secret Key</Label>
                  <Input
                    id="store-secret-key"
                    type="password"
                    value={paymentCredentials.secretKey ?? ''}
                    onChange={(e) =>
                      setPaymentCredentials({
                        ...paymentCredentials,
                        secretKey: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar Configuración
      </Button>
    </form>
  );
};
