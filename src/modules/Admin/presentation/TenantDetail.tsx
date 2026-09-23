'use client';

import Link from 'next/link';
import { useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Mail,
  Menu as MenuIcon,
  Newspaper,
  Pause,
  Palette,
  Pencil,
  Play,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  AdminPageResponseSchema,
  AdminPagesSchema,
  TenantResponseSchema,
  TenantsSchema,
  type AdminPage,
  type Tenant,
  type TenantStatus,
} from '../domain/AdminApi';
import { describeTenantStatus } from '../application/tenantPresentation';
import {
  describeAdminError,
  type AdminErrorMessage,
} from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { TenantDomains } from './TenantDomains';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

interface TenantDetailProps {
  readonly tenantId: string;
}

const TENANTS_CACHE_KEY = 'admin:tenants';

const FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  slug: 'Dirección (slug)',
  description: 'Descripción',
  isPublished: 'Publicación',
};

// La página "home" vive en la raíz del sitio; el resto cuelga de su slug.
const pagePath = (slug: string): string => (slug === 'home' ? '' : `/${slug}`);

export function TenantDetail({ tenantId }: TenantDetailProps): ReactElement {
  const api = useAdminApi();
  const pagesKey = `admin:tenant:${tenantId}:pages`;

  const tenants = useAsyncData(TENANTS_CACHE_KEY, async () => {
    const { tenants: list } = await api.get('/api/admin/tenants', TenantsSchema);
    return list;
  });
  const pages = useAsyncData(pagesKey, async () => {
    const { pages: list } = await api.get(
      `/api/admin/tenants/${tenantId}/pages`,
      AdminPagesSchema,
    );
    return list;
  });

  const tenant = tenants.data?.find((item) => String(item.id) === tenantId) ?? null;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const reloadPages = (): void => refreshAsyncData(pagesKey);

  if (tenants.error !== null) {
    return (
      <p role="alert" className="text-destructive">
        {tenants.error}
      </p>
    );
  }

  if (tenants.isLoading || tenants.data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando cliente...
      </p>
    );
  }

  if (tenant === null) {
    return (
      <p role="alert" className="text-destructive">
        No encontramos ese cliente.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Clientes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="ui-heading text-2xl">{tenant.name}</h1>
              <TenantStatusBadge status={tenant.status} />
            </div>
            <p className="text-muted-foreground text-sm">{tenant.slug}</p>
          </div>
          {tenant.primaryDomain !== null && (
            <a
              href={`http://${tenant.primaryDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-sm"
            >
              {tenant.primaryDomain} <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/clientes/${tenantId}/identidad`}>
            <Palette className="size-4" /> Identidad de marca
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/clientes/${tenantId}/imagenes`}>
            <ImageIcon className="size-4" /> Imágenes
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/clientes/${tenantId}/mensajes`}>
            <Mail className="size-4" /> Mensajes
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/clientes/${tenantId}/menu`}>
            <MenuIcon className="size-4" /> Menú de navegación
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/clientes/${tenantId}/blog`}>
            <Newspaper className="size-4" /> Blog
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/clientes/${tenantId}/tienda`}>
            <ShoppingBag className="size-4" /> Tienda
          </Link>
        </Button>
      </div>

      <TenantStatusSection tenantId={tenantId} tenant={tenant} />

      <TenantDomains tenantId={tenantId} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="ui-heading text-lg">Páginas</h2>
        <Button type="button" onClick={() => setIsCreateOpen((open) => !open)}>
          <Plus className="size-4" /> Nueva página
        </Button>
      </div>

      {isCreateOpen && (
        <CreatePageForm
          tenantId={tenantId}
          onCreated={() => {
            reloadPages();
            setIsCreateOpen(false);
          }}
          onCancel={() => setIsCreateOpen(false)}
        />
      )}

      {pages.error !== null && (
        <p role="alert" className="text-destructive">
          {pages.error}
        </p>
      )}

      {pages.error === null && (pages.isLoading || pages.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando páginas...
        </p>
      )}

      {pages.data !== null && pages.data.length === 0 && (
        <p className="text-muted-foreground">Este cliente todavía no tiene páginas.</p>
      )}

      {pages.data !== null && pages.data.length > 0 && (
        <ul className="space-y-4">
          {pages.data.map((page) =>
            editingPageId === page.id ? (
              <li key={page.id} className="ui-card p-5">
                <EditPageForm
                  tenantId={tenantId}
                  page={page}
                  onSaved={() => {
                    reloadPages();
                    setEditingPageId(null);
                  }}
                  onCancel={() => setEditingPageId(null)}
                />
              </li>
            ) : (
              <li key={page.id} className="ui-card space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/clientes/${tenantId}/paginas/${String(page.id)}`}
                      className="ui-heading block truncate text-lg hover:underline"
                    >
                      {page.title}
                    </Link>
                    <p className="text-muted-foreground truncate text-sm">/{page.slug}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      page.isPublished
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {page.isPublished ? 'Publicada' : 'Sin publicar'}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm">
                  {page.sections.length}{' '}
                  {page.sections.length === 1 ? 'bloque' : 'bloques'}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/clientes/${tenantId}/paginas/${String(page.id)}`}>
                      Editar bloques
                    </Link>
                  </Button>
                  {tenant.primaryDomain !== null && (
                    <Button asChild size="sm" variant="ghost">
                      <a
                        href={`http://${tenant.primaryDomain}${pagePath(page.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver página <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  <TogglePublishButton
                    tenantId={tenantId}
                    page={page}
                    isPending={pendingActionId === page.id}
                    onPending={setPendingActionId}
                    onDone={reloadPages}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={`Editar "${page.title}"`}
                    onClick={() => setEditingPageId(page.id)}
                  >
                    <Pencil className="size-4" /> Editar
                  </Button>
                  <DeletePageButton
                    tenantId={tenantId}
                    page={page}
                    isPending={pendingActionId === page.id}
                    onPending={setPendingActionId}
                    onDone={reloadPages}
                  />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

const STATUS_BADGE_CLASSES: Record<TenantStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  building: 'bg-muted text-muted-foreground',
};

function TenantStatusBadge({ status }: { readonly status: TenantStatus }): ReactElement {
  const description = describeTenantStatus(status);
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}
    >
      {description.label}
    </span>
  );
}

interface TenantStatusSectionProps {
  readonly tenantId: string;
  readonly tenant: Tenant;
}

// Pausar no borra nada: el contenido sigue ahí y reactivar deja el sitio tal cual estaba
// (SPEC 9.3). El cambio se confirma porque afecta de inmediato a quien visita el sitio.
function TenantStatusSection({
  tenantId,
  tenant,
}: TenantStatusSectionProps): ReactElement {
  const api = useAdminApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = async (nextStatus: TenantStatus): Promise<void> => {
    const confirmationMessage =
      nextStatus === 'paused'
        ? `Vas a pausar "${tenant.name}". El sitio dejará de responder a sus visitantes, pero no se borra nada: puedes reactivarlo cuando quieras y quedará tal cual estaba. ¿Continuar?`
        : `Vas a reactivar "${tenant.name}". El sitio volverá a responder tal cual estaba antes de pausarlo. ¿Continuar?`;
    const confirmed = window.confirm(confirmationMessage);
    if (!confirmed) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/status`,
        { status: nextStatus },
        TenantResponseSchema,
      );
      refreshAsyncData(TENANTS_CACHE_KEY);
      toast.success(nextStatus === 'paused' ? 'Cliente pausado.' : 'Cliente reactivado.');
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos cambiar el estado. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ui-card flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p className="font-medium">Estado del sitio</p>
        <p className="text-muted-foreground text-sm">
          {tenant.status === 'paused'
            ? 'El sitio no responde a sus visitantes. Nada de su contenido se ha borrado.'
            : 'Pausar no borra nada; reactivar deja el sitio tal cual estaba.'}
        </p>
      </div>
      {tenant.status === 'paused' ? (
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => void handleChange('active')}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Reactivar
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => void handleChange('paused')}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Pause className="size-4" />
          )}
          Pausar
        </Button>
      )}
    </div>
  );
}

interface CreatePageFormProps {
  readonly tenantId: string;
  readonly onCreated: () => void;
  readonly onCancel: () => void;
}

function CreatePageForm({
  tenantId,
  onCreated,
  onCancel,
}: CreatePageFormProps): ReactElement {
  const api = useAdminApi();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<AdminErrorMessage | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post(
        `/api/admin/tenants/${tenantId}/pages`,
        {
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() === '' ? null : description.trim(),
          isPublished: false,
        },
        AdminPageResponseSchema,
      );
      toast.success('Página creada, sin publicar todavía.');
      onCreated();
    } catch (cause) {
      setFormError(
        describeAdminError(cause, 'No pudimos crear la página. Inténtalo nuevamente.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="ui-card space-y-4 p-6"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="new-page-title">Título</Label>
        <Input
          id="new-page-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Servicios"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-page-slug">Dirección (slug)</Label>
        <Input
          id="new-page-slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="Ej. servicios"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-page-description">Descripción (opcional)</Label>
        <Textarea
          id="new-page-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <p className="text-muted-foreground text-sm">
        La página se crea sin publicar; podrás publicarla cuando esté lista.
      </p>
      <ErrorDetails error={formError} fieldLabels={FIELD_LABELS} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />} Crear página
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

interface EditPageFormProps {
  readonly tenantId: string;
  readonly page: AdminPage;
  readonly onSaved: () => void;
  readonly onCancel: () => void;
}

function EditPageForm({
  tenantId,
  page,
  onSaved,
  onCancel,
}: EditPageFormProps): ReactElement {
  const api = useAdminApi();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [description, setDescription] = useState(page.description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<AdminErrorMessage | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/pages/${String(page.id)}`,
        {
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() === '' ? null : description.trim(),
        },
        AdminPageResponseSchema,
      );
      toast.success('Página actualizada.');
      onSaved();
    } catch (cause) {
      setFormError(
        describeAdminError(
          cause,
          'No pudimos guardar los cambios. Inténtalo nuevamente.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor={`edit-title-${String(page.id)}`}>Título</Label>
        <Input
          id={`edit-title-${String(page.id)}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`edit-slug-${String(page.id)}`}>Dirección (slug)</Label>
        <Input
          id={`edit-slug-${String(page.id)}`}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`edit-description-${String(page.id)}`}>
          Descripción (opcional)
        </Label>
        <Textarea
          id={`edit-description-${String(page.id)}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <ErrorDetails error={formError} fieldLabels={FIELD_LABELS} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />} Guardar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

interface TogglePublishButtonProps {
  readonly tenantId: string;
  readonly page: AdminPage;
  readonly isPending: boolean;
  readonly onPending: (id: string | null) => void;
  readonly onDone: () => void;
}

function TogglePublishButton({
  tenantId,
  page,
  isPending,
  onPending,
  onDone,
}: TogglePublishButtonProps): ReactElement {
  const api = useAdminApi();

  // Publicar usa el endpoint dedicado, no un PATCH de `isPublished`: ese endpoint también
  // toma una foto del borrador actual (`publishedContent`), que es lo que sirve el sitio
  // público. Un PATCH a secas dejaría la página marcada como publicada pero sin nada (o con
  // una foto vieja) detrás. Despublicar sí es un simple cambio de visibilidad.
  const handleClick = async (): Promise<void> => {
    onPending(page.id);
    try {
      if (page.isPublished) {
        await api.patch(
          `/api/admin/tenants/${tenantId}/pages/${String(page.id)}`,
          { isPublished: false },
          AdminPageResponseSchema,
        );
        toast.success('Página despublicada.');
      } else {
        await api.post(
          `/api/admin/tenants/${tenantId}/pages/${String(page.id)}/publish`,
          {},
          AdminPageResponseSchema,
        );
        toast.success('Página publicada.');
      }
      onDone();
    } catch (cause) {
      toast.error(
        describeAdminError(
          cause,
          'No pudimos cambiar el estado de publicación. Inténtalo nuevamente.',
        ).message,
      );
    } finally {
      onPending(null);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => void handleClick()}
    >
      {isPending && <Loader2 className="size-4 animate-spin" />}
      {page.isPublished ? 'Despublicar' : 'Publicar'}
    </Button>
  );
}

interface DeletePageButtonProps {
  readonly tenantId: string;
  readonly page: AdminPage;
  readonly isPending: boolean;
  readonly onPending: (id: string | null) => void;
  readonly onDone: () => void;
}

function DeletePageButton({
  tenantId,
  page,
  isPending,
  onPending,
  onDone,
}: DeletePageButtonProps): ReactElement {
  const api = useAdminApi();

  const handleClick = async (): Promise<void> => {
    const confirmed = window.confirm(
      `Vas a eliminar la página "${page.title}" y también los ${page.sections.length} bloques que contiene. Esto no se puede deshacer. ¿Continuar?`,
    );
    if (!confirmed) {
      return;
    }
    onPending(page.id);
    try {
      await api.remove(`/api/admin/tenants/${tenantId}/pages/${String(page.id)}`);
      toast.success('Página eliminada.');
      onDone();
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos eliminar la página. Inténtalo nuevamente.')
          .message,
      );
    } finally {
      onPending(null);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="destructive"
      disabled={isPending}
      aria-label={`Eliminar "${page.title}"`}
      onClick={() => void handleClick()}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      Eliminar
    </Button>
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
