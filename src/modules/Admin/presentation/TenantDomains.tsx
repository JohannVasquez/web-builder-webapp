'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Globe, Loader2, Plus, Star, Trash2 } from 'lucide-react';
import {
  AddDomainResponseSchema,
  DomainResponseSchema,
  TenantDomainsSchema,
  type TenantDomain,
} from '../domain/AdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface TenantDomainsProps {
  readonly tenantId: string;
}

export function TenantDomains({ tenantId }: TenantDomainsProps): ReactElement {
  const api = useAdminApi();
  const domainsKey = `admin:tenant:${tenantId}:domains`;
  const domains = useAsyncData(domainsKey, async () => {
    const { domains: list } = await api.get(
      `/api/admin/tenants/${tenantId}/domains`,
      TenantDomainsSchema,
    );
    return list;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const reload = (): void => refreshAsyncData(domainsKey);

  const handleVerify = async (domain: TenantDomain): Promise<void> => {
    setPendingId(domain.id);
    try {
      await api.post(
        `/api/admin/tenants/${tenantId}/domains/${String(domain.id)}/verify`,
        {},
        DomainResponseSchema,
      );
      toast.success(`${domain.domain} quedó verificado.`);
      reload();
    } catch (cause) {
      toast.error(
        describeAdminError(
          cause,
          'No pudimos verificar el dominio. Inténtalo nuevamente.',
        ).message,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSetPrimary = async (domain: TenantDomain): Promise<void> => {
    setPendingId(domain.id);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/domains/${String(domain.id)}/primary`,
        {},
        DomainResponseSchema,
      );
      toast.success(`${domain.domain} es ahora el dominio principal.`);
      reload();
    } catch (cause) {
      toast.error(
        describeAdminError(
          cause,
          'No pudimos marcar ese dominio como principal. Inténtalo nuevamente.',
        ).message,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (domain: TenantDomain): Promise<void> => {
    const confirmed = window.confirm(
      `Vas a eliminar el dominio "${domain.domain}". Esto no se puede deshacer. ¿Continuar?`,
    );
    if (!confirmed) {
      return;
    }
    setPendingId(domain.id);
    try {
      await api.remove(`/api/admin/tenants/${tenantId}/domains/${String(domain.id)}`);
      toast.success('Dominio eliminado.');
      reload();
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos eliminar el dominio. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="ui-heading text-lg">Dominios</h2>
        <Button type="button" size="sm" onClick={() => setIsAddOpen((open) => !open)}>
          <Plus className="size-4" /> Agregar dominio
        </Button>
      </div>

      {isAddOpen && (
        <AddDomainForm
          tenantId={tenantId}
          onAdded={() => {
            reload();
            setIsAddOpen(false);
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      )}

      {domains.error !== null && (
        <p role="alert" className="text-destructive">
          {domains.error}
        </p>
      )}

      {domains.error === null && (domains.isLoading || domains.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando dominios...
        </p>
      )}

      {domains.data !== null && (
        <DomainList
          domains={domains.data}
          pendingId={pendingId}
          onVerify={(domain) => void handleVerify(domain)}
          onSetPrimary={(domain) => void handleSetPrimary(domain)}
          onDelete={(domain) => void handleDelete(domain)}
        />
      )}
    </div>
  );
}

interface AddDomainFormProps {
  readonly tenantId: string;
  readonly onAdded: () => void;
  readonly onCancel: () => void;
}

function AddDomainForm({ tenantId, onAdded, onCancel }: AddDomainFormProps): ReactElement {
  const api = useAdminApi();
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post(
        `/api/admin/tenants/${tenantId}/domains`,
        { domain: domain.trim() },
        AddDomainResponseSchema,
      );
      toast.success('Dominio agregado. Configura el DNS para verificarlo.');
      onAdded();
    } catch (cause) {
      setFormError(
        describeAdminError(cause, 'No pudimos agregar ese dominio. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="ui-card space-y-4 p-5"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="new-domain">Dominio</Label>
        <Input
          id="new-domain"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="Ej. mitienda.cl"
          required
        />
      </div>
      {formError !== null && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />} Agregar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export interface DomainListProps {
  readonly domains: readonly TenantDomain[];
  readonly pendingId: string | null;
  readonly onVerify: (domain: TenantDomain) => void;
  readonly onSetPrimary: (domain: TenantDomain) => void;
  readonly onDelete: (domain: TenantDomain) => void;
}

// Sin hooks propios (ni sesión ni datos remotos) para poder renderizarla en pruebas con
// `renderToStaticMarkup`, igual que `UserList` en `UserManager.tsx`.
export function DomainList({
  domains,
  pendingId,
  onVerify,
  onSetPrimary,
  onDelete,
}: DomainListProps): ReactElement {
  if (domains.length === 0) {
    return <p className="text-muted-foreground">Este cliente todavía no tiene dominios.</p>;
  }

  return (
    <ul className="space-y-4">
      {domains.map((domain) => (
        <DomainRow
          key={domain.id}
          domain={domain}
          isPending={pendingId === domain.id}
          onVerify={() => onVerify(domain)}
          onSetPrimary={() => onSetPrimary(domain)}
          onDelete={() => onDelete(domain)}
        />
      ))}
    </ul>
  );
}

interface DomainRowProps {
  readonly domain: TenantDomain;
  readonly isPending: boolean;
  readonly onVerify: () => void;
  readonly onSetPrimary: () => void;
  readonly onDelete: () => void;
}

function DomainRow({
  domain,
  isPending,
  onVerify,
  onSetPrimary,
  onDelete,
}: DomainRowProps): ReactElement {
  return (
    <li className="ui-card space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="text-muted-foreground size-4 shrink-0" />
          <span className="font-medium">{domain.domain}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {domain.isPrimary && (
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">
              Principal
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              domain.isVerified
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {domain.isVerified ? 'Verificado' : 'Sin verificar'}
          </span>
        </div>
      </div>

      {!domain.isVerified && domain.instructions.length > 0 && (
        <DnsInstructions instructions={domain.instructions} />
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {!domain.isVerified && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onVerify}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />} Verificar
          </Button>
        )}
        {domain.isVerified && !domain.isPrimary && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onSetPrimary}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Star className="size-4" />
            )}
            Marcar como principal
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          aria-label={`Eliminar "${domain.domain}"`}
          onClick={onDelete}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Eliminar
        </Button>
      </div>
    </li>
  );
}

function DnsInstructions({
  instructions,
}: {
  readonly instructions: TenantDomain['instructions'];
}): ReactElement {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        Crea estos registros en el panel de tu proveedor de dominio. El DNS puede demorar
        unas horas en propagarse.
      </p>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-muted-foreground text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Host</th>
              <th className="px-3 py-2 font-medium">Valor</th>
              <th className="px-3 py-2 font-medium">Para qué sirve</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {instructions.map((record) => (
              <tr key={`${record.type}-${record.host}`} className="border-t">
                <td className="px-3 py-2 font-mono">{record.type}</td>
                <td className="px-3 py-2 font-mono break-all">{record.host}</td>
                <td className="px-3 py-2 font-mono break-all">{record.value}</td>
                <td className="text-muted-foreground px-3 py-2">{record.purpose}</td>
                <td className="px-3 py-2">
                  <CopyButton value={record.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CopyButton({ value }: { readonly value: string }): ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('No pudimos copiar el valor. Selecciónalo y cópialo manualmente.');
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label="Copiar valor"
      className="hover:bg-accent flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}
