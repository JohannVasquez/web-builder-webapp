'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Loader2, Plus, Search } from 'lucide-react';
import {
  SiteTemplatesSchema,
  TenantResponseSchema,
  TenantsSchema,
  type SiteTemplate,
  type Tenant,
} from '../domain/AdminApi';
import {
  TENANT_STATUS_OPTIONS,
  describeTenantStatus,
  filterTenants,
  type TenantStatusFilter,
} from '../application/tenantPresentation';
import { proposeSlug, type CreateTenantMode } from '../application/tenantForm';
import {
  describeAdminError,
  type AdminErrorMessage,
} from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export const TENANTS_CACHE_KEY = 'admin:tenants';
const SITE_TEMPLATES_CACHE_KEY = 'admin:site-templates';

const STATUS_BADGE_CLASSES: Record<Tenant['status'], string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  building: 'bg-muted text-muted-foreground',
};

const FIELD_LABELS: Record<string, string> = {
  slug: 'Dirección (slug)',
  name: 'Nombre',
  domains: 'Dominio',
  templateId: 'Plantilla',
  duplicateFromTenantId: 'Cliente a duplicar',
};

export interface TenantCardsProps {
  readonly tenants: readonly Tenant[];
}

// Sin hooks propios (ni sesión ni datos remotos) para poder renderizarla en pruebas con
// `renderToStaticMarkup`, igual que `UserList` en `UserManager.tsx`.
export function TenantCards({ tenants }: TenantCardsProps): ReactElement {
  if (tenants.length === 0) {
    return (
      <p className="text-muted-foreground">
        No hay clientes que coincidan con la búsqueda.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {tenants.map((tenant) => {
        const status = describeTenantStatus(tenant.status);
        return (
          <li key={tenant.id} className="ui-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/clientes/${String(tenant.id)}`}
                  className="ui-heading block truncate text-lg hover:underline"
                >
                  {tenant.name}
                </Link>
                <p className="text-muted-foreground truncate text-sm">{tenant.slug}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[tenant.status]}`}
              >
                {status.label}
              </span>
            </div>
            {tenant.primaryDomain !== null && (
              <a
                href={`http://${tenant.primaryDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1 text-sm"
              >
                Ver sitio <ExternalLink className="size-3.5" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function TenantList(): ReactElement {
  const api = useAdminApi();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatusFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, error, isLoading } = useAsyncData(TENANTS_CACHE_KEY, async () => {
    const { tenants: list } = await api.get('/api/admin/tenants', TenantsSchema);
    return list;
  });

  if (error !== null) {
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  }

  if (isLoading || data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando clientes...
      </p>
    );
  }

  const visible = filterTenants(data, query, statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="ui-heading text-2xl">Clientes</h1>
        <Button type="button" onClick={() => setIsFormOpen((open) => !open)}>
          <Plus className="size-4" /> Nuevo cliente
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Buscar cliente"
            placeholder="Buscar..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filtrar por estado"
          className="ui-input h-9 px-2 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as TenantStatusFilter)}
        >
          <option value="all">Todos los estados</option>
          {TENANT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isFormOpen && (
        <CreateTenantForm
          tenants={data}
          onCancel={() => setIsFormOpen(false)}
          onCreated={() => setIsFormOpen(false)}
        />
      )}

      <TenantCards tenants={visible} />
    </div>
  );
}

interface CreateTenantFormProps {
  readonly tenants: readonly Tenant[];
  readonly onCreated: () => void;
  readonly onCancel: () => void;
}

function CreateTenantForm({
  tenants,
  onCreated,
  onCancel,
}: CreateTenantFormProps): ReactElement {
  const api = useAdminApi();
  const router = useRouter();

  const templates = useAsyncData(SITE_TEMPLATES_CACHE_KEY, async () => {
    const { templates: list } = await api.get(
      '/api/admin/site-templates',
      SiteTemplatesSchema,
    );
    return list;
  });

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [domain, setDomain] = useState('');
  const [mode, setMode] = useState<CreateTenantMode>('empty');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [duplicateFromTenantId, setDuplicateFromTenantId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<AdminErrorMessage | null>(null);

  const handleNameChange = (value: string): void => {
    setName(value);
    if (!slugTouched) {
      setSlug(proposeSlug(value));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    if (mode === 'template' && templateId === null) {
      setFormError({ message: 'Elige una plantilla por rubro.', issues: [] });
      return;
    }
    if (mode === 'duplicate' && duplicateFromTenantId === null) {
      setFormError({ message: 'Elige qué cliente quieres duplicar.', issues: [] });
      return;
    }

    setIsSubmitting(true);
    try {
      const { tenant } = await api.post(
        '/api/admin/tenants',
        {
          slug: slug.trim(),
          name: name.trim(),
          domains: domain.trim() === '' ? [] : [domain.trim()],
          templateId: mode === 'template' ? (templateId ?? undefined) : undefined,
          duplicateFromTenantId:
            mode === 'duplicate' ? (duplicateFromTenantId ?? undefined) : undefined,
        },
        TenantResponseSchema,
      );
      refreshAsyncData(TENANTS_CACHE_KEY);
      toast.success('Cliente creado.');
      onCreated();
      router.push(`/clientes/${String(tenant.id)}`);
    } catch (cause) {
      setFormError(
        describeAdminError(cause, 'No pudimos crear el cliente. Inténtalo nuevamente.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="ui-card space-y-5 p-6"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="new-tenant-name">Nombre</Label>
        <Input
          id="new-tenant-name"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder="Ej. Pastelería Luna"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-tenant-slug">Dirección (slug)</Label>
        <Input
          id="new-tenant-slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          placeholder="Ej. pasteleria-luna"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-tenant-domain">Dominio inicial (opcional)</Label>
        <Input
          id="new-tenant-domain"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="Ej. pasteleriauna.cl"
        />
        <p className="text-muted-foreground text-sm">
          Puedes agregar o cambiar dominios más tarde desde la ficha del cliente.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Contenido inicial</legend>
        <label className="ui-input flex cursor-pointer items-start gap-2 p-3 text-sm has-[:checked]:border-primary">
          <input
            type="radio"
            name="create-mode"
            checked={mode === 'empty'}
            onChange={() => setMode('empty')}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Vacío</span>
            <span className="text-muted-foreground text-xs">
              El cliente nace sin páginas; se arma todo desde cero.
            </span>
          </span>
        </label>
        <label className="ui-input flex cursor-pointer items-start gap-2 p-3 text-sm has-[:checked]:border-primary">
          <input
            type="radio"
            name="create-mode"
            checked={mode === 'template'}
            onChange={() => setMode('template')}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Plantilla por rubro</span>
            <span className="text-muted-foreground text-xs">
              Copia un kit de inicio (textos, secciones y colores) para ese rubro.
            </span>
          </span>
        </label>
        {mode === 'template' && (
          <TemplatePicker
            templates={templates.data}
            isLoading={templates.isLoading}
            error={templates.error}
            selectedId={templateId}
            onSelect={setTemplateId}
          />
        )}
        <label className="ui-input flex cursor-pointer items-start gap-2 p-3 text-sm has-[:checked]:border-primary">
          <input
            type="radio"
            name="create-mode"
            checked={mode === 'duplicate'}
            onChange={() => setMode('duplicate')}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Duplicar otro cliente</span>
            <span className="text-muted-foreground text-xs">
              Copia el sitio de otro cliente sin sus dominios ni sus mensajes; las páginas
              nacen despublicadas.
            </span>
          </span>
        </label>
        {mode === 'duplicate' && (
          <DuplicatePicker
            tenants={tenants}
            selectedId={duplicateFromTenantId}
            onSelect={setDuplicateFromTenantId}
          />
        )}
      </fieldset>

      <ErrorDetails error={formError} fieldLabels={FIELD_LABELS} />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />} Crear cliente
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

interface TemplatePickerProps {
  readonly templates: readonly SiteTemplate[] | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}

function TemplatePicker({
  templates,
  isLoading,
  error,
  selectedId,
  onSelect,
}: TemplatePickerProps): ReactElement {
  if (error !== null) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error}
      </p>
    );
  }
  if (isLoading || templates === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Cargando plantillas...
      </p>
    );
  }
  return (
    <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-3">
      {templates.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay plantillas disponibles.</p>
      ) : (
        templates.map((template) => (
          <label
            key={template.id}
            className="flex cursor-pointer items-start gap-2 p-2 text-sm"
          >
            <input
              type="radio"
              name="template"
              checked={selectedId === template.id}
              onChange={() => onSelect(template.id)}
              className="mt-1"
            />
            <span>
              <span className="block font-medium">{template.label}</span>
              <span className="text-muted-foreground text-xs">
                {template.description} · {template.pageCount}{' '}
                {template.pageCount === 1 ? 'página' : 'páginas'}
              </span>
            </span>
          </label>
        ))
      )}
    </div>
  );
}

interface DuplicatePickerProps {
  readonly tenants: readonly Tenant[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}

function DuplicatePicker({
  tenants,
  selectedId,
  onSelect,
}: DuplicatePickerProps): ReactElement {
  if (tenants.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No hay otros clientes para duplicar.</p>
    );
  }
  return (
    <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-3">
      {tenants.map((tenant) => (
        <label key={tenant.id} className="flex items-center gap-2 p-2 text-sm">
          <input
            type="radio"
            name="duplicate-from"
            checked={selectedId === tenant.id}
            onChange={() => onSelect(tenant.id)}
          />
          {tenant.name}
        </label>
      ))}
    </div>
  );
}

interface ErrorDetailsProps {
  readonly error: AdminErrorMessage | null;
  readonly fieldLabels: Record<string, string>;
}

function ErrorDetails({ error, fieldLabels }: ErrorDetailsProps): ReactElement | null {
  if (error === null) {
    return null;
  }
  return (
    <div role="alert" className="text-destructive space-y-1 text-sm">
      <p>{error.message}</p>
      {error.issues.length > 0 && (
        <ul className="list-disc pl-5">
          {error.issues.map((issue) => (
            <li key={issue.path}>
              {fieldLabels[issue.path] ?? issue.path}: {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
