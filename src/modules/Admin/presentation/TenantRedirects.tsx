'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ArrowRight } from 'lucide-react';
import {
  RedirectsSchema,
  RedirectResponseSchema,
  type AdminRedirect,
} from '../domain/AdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface TenantRedirectsProps {
  readonly tenantId: string;
}

export function TenantRedirects({ tenantId }: TenantRedirectsProps): ReactElement {
  const api = useAdminApi();
  const redirectsKey = `admin:tenant:${tenantId}:redirects`;
  const redirects = useAsyncData(redirectsKey, async () => {
    const { redirects: list } = await api.get(
      `/api/admin/tenants/${tenantId}/redirecciones`,
      RedirectsSchema,
    );
    return list;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const reload = (): void => refreshAsyncData(redirectsKey);

  const handleDelete = async (redirect: AdminRedirect): Promise<void> => {
    const confirmed = window.confirm(
      `Vas a eliminar la redirección de "${redirect.fromPath}". La dirección antigua volverá a caer en 404. ¿Continuar?`,
    );
    if (!confirmed) {
      return;
    }
    setPendingId(redirect.id);
    try {
      await api.remove(`/api/admin/tenants/${tenantId}/redirecciones/${redirect.id}`);
      toast.success('Redirección eliminada.');
      reload();
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos eliminar la redirección. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="ui-heading text-lg">Redirecciones</h2>
        <Button type="button" size="sm" onClick={() => setIsAddOpen((open) => !open)}>
          <Plus className="size-4" /> Agregar redirección
        </Button>
      </div>

      {isAddOpen && (
        <AddRedirectForm
          tenantId={tenantId}
          onAdded={() => {
            reload();
            setIsAddOpen(false);
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      )}

      {redirects.error !== null && (
        <p role="alert" className="text-destructive">
          {redirects.error}
        </p>
      )}

      {redirects.error === null && (redirects.isLoading || redirects.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando redirecciones...
        </p>
      )}

      {redirects.data !== null && (
        <RedirectList
          redirects={redirects.data}
          pendingId={pendingId}
          onDelete={(redirect) => void handleDelete(redirect)}
        />
      )}
    </div>
  );
}

interface AddRedirectFormProps {
  readonly tenantId: string;
  readonly onAdded: () => void;
  readonly onCancel: () => void;
}

function AddRedirectForm({
  tenantId,
  onAdded,
  onCancel,
}: AddRedirectFormProps): ReactElement {
  const api = useAdminApi();
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post(
        `/api/admin/tenants/${tenantId}/redirecciones`,
        { fromPath: fromPath.trim(), toPath: toPath.trim(), statusCode: 301 },
        RedirectResponseSchema,
      );
      toast.success('Redirección agregada.');
      onAdded();
    } catch (cause) {
      setFormError(
        describeAdminError(cause, 'No pudimos agregar la redirección. Inténtalo nuevamente.')
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="from-path">Ruta antigua</Label>
          <Input
            id="from-path"
            value={fromPath}
            onChange={(event) => setFromPath(event.target.value)}
            placeholder="Ej. /nosotros"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-path">Ruta nueva</Label>
          <Input
            id="to-path"
            value={toPath}
            onChange={(event) => setToPath(event.target.value)}
            placeholder="Ej. /equipo"
            required
          />
        </div>
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

export interface RedirectListProps {
  readonly redirects: readonly AdminRedirect[];
  readonly pendingId: string | null;
  readonly onDelete: (redirect: AdminRedirect) => void;
}

export function RedirectList({
  redirects,
  pendingId,
  onDelete,
}: RedirectListProps): ReactElement {
  if (redirects.length === 0) {
    return <p className="text-muted-foreground">Este cliente todavía no tiene redirecciones.</p>;
  }

  return (
    <ul className="space-y-4">
      {redirects.map((redirect) => (
        <li key={redirect.id} className="ui-card space-y-3 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm">{redirect.fromPath}</span>
            <ArrowRight className="size-4 text-muted-foreground" />
            <span className="font-mono text-sm font-medium">{redirect.toPath}</span>
          </div>

          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pendingId === redirect.id}
            aria-label={`Eliminar redirección de "${redirect.fromPath}"`}
            onClick={() => onDelete(redirect)}
          >
            {pendingId === redirect.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Eliminar
          </Button>
        </li>
      ))}
    </ul>
  );
}
