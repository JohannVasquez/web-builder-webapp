'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Ban, Check, Copy, Loader2, Plus, RefreshCw, X } from 'lucide-react';
import {
  ApiKeysSchema,
  CreatedApiKeySchema,
  TenantsSchema,
  type ApiKey,
} from '../domain/AdminApi';
import {
  PERMISSION_OPTIONS,
  describeApiKeyScope,
  describeApiKeyStatus,
  permissionLabel,
} from '../application/apiKeyPresentation';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const API_KEYS_CACHE_KEY = 'admin:api-keys';
const TENANTS_CACHE_KEY = 'admin:tenants';
const DEFAULT_EXPIRY_DAYS = '90';

const STATUS_BADGE_CLASSES: Record<'active' | 'revoked' | 'expired', string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  revoked: 'bg-destructive/10 text-destructive',
  expired: 'bg-muted text-muted-foreground',
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  permission: 'Permiso',
  tenantIds: 'Alcance',
  expiresInDays: 'Vencimiento',
};

const formatDate = (iso: string | null): string =>
  iso === null
    ? 'Nunca'
    : new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });

interface Revealed {
  readonly apiKey: ApiKey;
  readonly token: string;
  readonly warning: string;
}

export function ApiKeyManager(): ReactElement {
  const api = useAdminApi();
  const keys = useAsyncData(API_KEYS_CACHE_KEY, async () => {
    const { apiKeys } = await api.get('/api/admin/api-keys', ApiKeysSchema);
    return apiKeys;
  });
  const tenants = useAsyncData(TENANTS_CACHE_KEY, async () => {
    const { tenants: list } = await api.get('/api/admin/tenants', TenantsSchema);
    return list;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [permission, setPermission] = useState<ApiKey['permission']>('write');
  const [scopeMode, setScopeMode] = useState<'all' | 'selected'>('all');
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<number>>(new Set());
  const [expiryMode, setExpiryMode] = useState<'days' | 'never'>('days');
  const [expiryDays, setExpiryDays] = useState(DEFAULT_EXPIRY_DAYS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<{
    message: string;
    issues: readonly { path: string; message: string }[];
  } | null>(null);

  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const toggleTenant = (id: number): void => {
    setSelectedTenantIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetForm = (): void => {
    setName('');
    setPermission('write');
    setScopeMode('all');
    setSelectedTenantIds(new Set());
    setExpiryMode('days');
    setExpiryDays(DEFAULT_EXPIRY_DAYS);
    setFormError(null);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    if (name.trim() === '') {
      setFormError({ message: 'Ponle un nombre a la clave.', issues: [] });
      return;
    }
    if (scopeMode === 'selected' && selectedTenantIds.size === 0) {
      setFormError({
        message:
          'Una clave con alcance limitado necesita al menos un cliente seleccionado.',
        issues: [],
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.post(
        '/api/admin/api-keys',
        {
          name: name.trim(),
          permission,
          tenantIds: scopeMode === 'all' ? null : Array.from(selectedTenantIds),
          expiresInDays: expiryMode === 'never' ? null : Number(expiryDays),
        },
        CreatedApiKeySchema,
      );
      setRevealed(created);
      refreshAsyncData(API_KEYS_CACHE_KEY);
      resetForm();
      setIsFormOpen(false);
      toast.success('Clave creada.');
    } catch (cause) {
      setFormError(
        describeAdminError(cause, 'No pudimos crear la clave. Inténtalo nuevamente.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (apiKey: ApiKey): Promise<void> => {
    const confirmed = window.confirm(
      `Vas a revocar "${apiKey.name}". La clave dejará de funcionar de inmediato y esto no se puede deshacer. ¿Continuar?`,
    );
    if (!confirmed) {
      return;
    }
    setPendingActionId(apiKey.id);
    try {
      await api.remove(`/api/admin/api-keys/${String(apiKey.id)}`);
      refreshAsyncData(API_KEYS_CACHE_KEY);
      toast.success('Clave revocada.');
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos revocar la clave. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setPendingActionId(null);
    }
  };

  const handleRegenerate = async (apiKey: ApiKey): Promise<void> => {
    const confirmed = window.confirm(
      `Vas a regenerar "${apiKey.name}". Esto revoca la clave actual de inmediato y crea una nueva. ¿Continuar?`,
    );
    if (!confirmed) {
      return;
    }
    setPendingActionId(apiKey.id);
    try {
      const created = await api.post(
        `/api/admin/api-keys/${String(apiKey.id)}/regenerate`,
        {},
        CreatedApiKeySchema,
      );
      setRevealed(created);
      refreshAsyncData(API_KEYS_CACHE_KEY);
      toast.success('Clave regenerada.');
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos regenerar la clave. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setPendingActionId(null);
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (revealed === null) {
      return;
    }
    try {
      await navigator.clipboard.writeText(revealed.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No pudimos copiar la clave. Selecciónala y cópiala manualmente.');
    }
  };

  const tenantList = tenants.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="ui-heading text-2xl">Claves de acceso</h1>
        <Button type="button" onClick={() => setIsFormOpen((open) => !open)}>
          <Plus className="size-4" /> Nueva clave
        </Button>
      </div>

      {revealed !== null && (
        <div
          role="alert"
          className="ui-card space-y-3 border-2 border-amber-400 bg-amber-50 p-5 dark:border-amber-500 dark:bg-amber-500/10"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="ui-heading text-lg">Clave lista: {revealed.apiKey.name}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar aviso de clave nueva"
              onClick={() => setRevealed(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {revealed.warning} Cópiala ahora: no se volverá a mostrar.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="ui-input min-w-0 flex-1 overflow-x-auto px-3 py-2 font-mono text-sm break-all">
              {revealed.token}
            </code>
            <Button type="button" size="sm" onClick={() => void handleCopy()}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copiar
            </Button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={(event) => void handleCreate(event)}
          className="ui-card space-y-5 p-6"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="api-key-name">Nombre</Label>
            <Input
              id="api-key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Integración de reservas"
              required
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Permiso</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {PERMISSION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="ui-input flex cursor-pointer items-start gap-2 p-3 text-sm has-[:checked]:border-primary"
                >
                  <input
                    type="radio"
                    name="permission"
                    value={option.value}
                    checked={permission === option.value}
                    onChange={() => setPermission(option.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Alcance</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="scope"
                checked={scopeMode === 'all'}
                onChange={() => setScopeMode('all')}
              />
              Todos los clientes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="scope"
                checked={scopeMode === 'selected'}
                onChange={() => setScopeMode('selected')}
              />
              Solo clientes seleccionados
            </label>
            {scopeMode === 'selected' && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-3">
                {tenantList.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No hay clientes para elegir.
                  </p>
                ) : (
                  tenantList.map((tenant) => (
                    <label key={tenant.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTenantIds.has(tenant.id)}
                        onChange={() => toggleTenant(tenant.id)}
                      />
                      {tenant.name}
                    </label>
                  ))
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Vencimiento</legend>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="expiry"
                  checked={expiryMode === 'days'}
                  onChange={() => setExpiryMode('days')}
                />
                Vence en
              </label>
              <Input
                type="number"
                min={1}
                max={3650}
                aria-label="Días para vencer"
                value={expiryDays}
                onChange={(event) => setExpiryDays(event.target.value)}
                disabled={expiryMode !== 'days'}
                className="w-24"
              />
              <span className="text-muted-foreground text-sm">días</span>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="expiry"
                checked={expiryMode === 'never'}
                onChange={() => setExpiryMode('never')}
              />
              Sin vencimiento
            </label>
          </fieldset>

          {formError !== null && (
            <div role="alert" className="text-destructive space-y-1 text-sm">
              <p>{formError.message}</p>
              {formError.issues.length > 0 && (
                <ul className="list-disc pl-5">
                  {formError.issues.map((issue) => (
                    <li key={issue.path}>
                      {FIELD_LABELS[issue.path] ?? issue.path}: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />} Crear clave
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {keys.error !== null && (
        <p role="alert" className="text-destructive">
          {keys.error}
        </p>
      )}

      {keys.error === null && (keys.isLoading || keys.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando claves...
        </p>
      )}

      {keys.data !== null && keys.data.length === 0 && (
        <p className="text-muted-foreground">Todavía no hay claves de acceso creadas.</p>
      )}

      {keys.data !== null && keys.data.length > 0 && (
        <ul className="space-y-4">
          {keys.data.map((apiKey) => {
            const status = describeApiKeyStatus(apiKey.status);
            const isPending = pendingActionId === apiKey.id;
            return (
              <li
                key={apiKey.id}
                className={`ui-card space-y-3 p-5 ${status.isUsable ? '' : 'opacity-60'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{apiKey.name}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {apiKey.prefix}••••••••
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[status.tone]}`}
                  >
                    {status.label}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-muted-foreground text-xs">Permiso</dt>
                    <dd>{permissionLabel(apiKey.permission)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Alcance</dt>
                    <dd>{describeApiKeyScope(apiKey, tenantList)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Creación</dt>
                    <dd>{formatDate(apiKey.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Último uso</dt>
                    <dd>{formatDate(apiKey.lastUsedAt)}</dd>
                  </div>
                </dl>

                {status.isUsable && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => void handleRegenerate(apiKey)}
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      Regenerar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => void handleRevoke(apiKey)}
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Ban className="size-4" />
                      )}
                      Revocar
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
