'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import {
  AdminPageResponseSchema,
  AdminPagesSchema,
  TenantsSchema,
  type AdminSection,
} from '../domain/AdminApi';
import { BLOCK_CATALOG } from '../domain/blockCatalog';
import { blockPropsHint } from '../domain/blockHints';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  insertDuplicateAfter,
  moveSectionDown,
  moveSectionUp,
} from '../application/sectionOrdering';
import { formatProps, parseProps } from '../application/propsEditor';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

interface PageEditorProps {
  readonly tenantId: string;
  readonly pageId: string;
}

const summarize = (section: AdminSection): string => {
  const props = section.props;
  for (const key of ['title', 'eyebrow', 'heading', 'text']) {
    const value = props[key];
    if (typeof value === 'string' && value !== '') {
      return value;
    }
  }
  return 'Sin título';
};

const labelFor = (type: string): string =>
  BLOCK_CATALOG.find((entry) => entry.type === type)?.label ?? type;

export function PageEditor({ tenantId, pageId }: PageEditorProps): ReactElement {
  const api = useAdminApi();
  const base = `/api/admin/tenants/${tenantId}/pages/${pageId}`;
  const cacheKey = `admin:tenant:${tenantId}:page:${pageId}`;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const hasUnsavedChanges = editingId !== null;
  useUnsavedChangesGuard(hasUnsavedChanges);

  const tenants = useAsyncData('admin:tenants', async () => {
    const { tenants: list } = await api.get('/api/admin/tenants', TenantsSchema);
    return list;
  });

  const page = useAsyncData(cacheKey, async () => {
    const { pages } = await api.get(
      `/api/admin/tenants/${tenantId}/pages`,
      AdminPagesSchema,
    );
    const found = pages.find((candidate) => String(candidate.id) === pageId);
    if (found === undefined) {
      throw new Error('Esta página ya no existe.');
    }
    return found;
  });

  const tenant = tenants.data?.find((candidate) => String(candidate.id) === tenantId);

  const run = async (action: () => Promise<unknown>, done: string): Promise<void> => {
    setIsBusy(true);
    try {
      await action();
      refreshAsyncData(cacheKey);
      toast.success(done);
    } catch (cause) {
      const { message, issues } = describeAdminError(
        cause,
        'No pudimos guardar el cambio. Inténtalo nuevamente.',
      );
      toast.error(
        issues.length === 0
          ? message
          : `${message} ${issues.map((issue) => `${issue.path}: ${issue.message}`).join(' · ')}`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const reorder = async (sectionIds: number[]): Promise<void> => {
    await run(
      () => api.put(`${base}/sections/reorder`, { sectionIds }, AdminPageResponseSchema),
      'Orden actualizado.',
    );
  };

  const startEditing = (section: AdminSection): void => {
    if (
      hasUnsavedChanges &&
      !window.confirm('Tienes cambios sin guardar. ¿Descartarlos?')
    ) {
      return;
    }
    setEditingId(section.id);
    setDraft(formatProps(section.props));
    setJsonError(null);
  };

  const save = async (section: AdminSection): Promise<void> => {
    const parsed = parseProps(draft);
    if (!parsed.ok) {
      setJsonError(parsed.error);
      return;
    }
    await run(
      () =>
        api.patch(
          `${base}/sections/${String(section.id)}`,
          { props: parsed.value },
          AdminPageResponseSchema,
        ),
      'Bloque guardado.',
    );
    setEditingId(null);
  };

  if (page.error !== null) {
    return (
      <p role="alert" className="text-destructive">
        {page.error}
      </p>
    );
  }
  if (page.isLoading || page.data === null) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando la página...
      </p>
    );
  }

  const sections = [...page.data.sections].sort((a, b) => a.position - b.position);
  const ids = sections.map((section) => section.id);
  const previewPath = page.data.slug === 'home' ? '' : `/${page.data.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/clientes/${tenantId}`}
            className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" /> Volver al cliente
          </Link>
          <h1 className="ui-heading truncate text-2xl">{page.data.title}</h1>
          <p className="text-muted-foreground text-sm">
            {sections.length} {sections.length === 1 ? 'bloque' : 'bloques'}
            {page.data.isPublished ? '' : ' · sin publicar'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tenant?.primaryDomain != null && (
            <a
              href={`http://${tenant.primaryDomain}${previewPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
            >
              Vista previa <ExternalLink className="size-3.5" />
            </a>
          )}
          <Button onClick={() => setShowCatalog((open) => !open)} disabled={isBusy}>
            <Plus className="size-4" /> Agregar bloque
          </Button>
        </div>
      </div>

      {showCatalog && (
        <div className="ui-card p-4">
          <h2 className="ui-heading mb-3 text-lg">Catálogo de bloques</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {BLOCK_CATALOG.map((entry) => (
              <li key={entry.type}>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    setShowCatalog(false);
                    void run(
                      () =>
                        api.post(
                          `${base}/sections`,
                          { type: entry.type, position: sections.length, props: {} },
                          AdminPageResponseSchema,
                        ),
                      `Bloque "${entry.label}" agregado.`,
                    );
                  }}
                  className="hover:bg-accent w-full rounded-md p-3 text-left transition-colors disabled:opacity-50"
                >
                  <span className="block font-medium">{entry.label}</span>
                  <span className="text-muted-foreground block text-sm">
                    {entry.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sections.length === 0 ? (
        <p className="text-muted-foreground">
          Esta página no tiene bloques todavía. Agrega el primero con el botón de arriba.
        </p>
      ) : (
        <ol className="space-y-3">
          {sections.map((section, index) => (
            <li key={section.id} className="ui-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{labelFor(section.type)}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {summarize(section)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Subir bloque"
                    disabled={isBusy || index === 0}
                    onClick={() => void reorder(moveSectionUp(ids, section.id))}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Bajar bloque"
                    disabled={isBusy || index === sections.length - 1}
                    onClick={() => void reorder(moveSectionDown(ids, section.id))}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Duplicar bloque"
                    disabled={isBusy}
                    onClick={() =>
                      void run(async () => {
                        const { page: updated } = await api.post(
                          `${base}/sections`,
                          {
                            type: section.type,
                            position: sections.length,
                            props: section.props,
                            anchor: null,
                          },
                          AdminPageResponseSchema,
                        );
                        const created = updated.sections
                          .map((candidate) => candidate.id)
                          .filter((id) => !ids.includes(id))[0];
                        if (created !== undefined) {
                          await api.put(
                            `${base}/sections/reorder`,
                            {
                              sectionIds: insertDuplicateAfter(ids, section.id, created),
                            },
                            AdminPageResponseSchema,
                          );
                        }
                      }, 'Bloque duplicado.')
                    }
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(section)}
                    disabled={isBusy}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Eliminar bloque"
                    disabled={isBusy}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `¿Eliminar el bloque "${labelFor(section.type)}"? Esta acción no se puede deshacer.`,
                        )
                      ) {
                        return;
                      }
                      void run(
                        () => api.remove(`${base}/sections/${String(section.id)}`),
                        'Bloque eliminado.',
                      );
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {editingId === section.id && (
                <div className="mt-4 space-y-3">
                  <label
                    htmlFor={`props-${String(section.id)}`}
                    className="text-sm font-medium"
                  >
                    Contenido del bloque (JSON)
                  </label>
                  <Textarea
                    id={`props-${String(section.id)}`}
                    value={draft}
                    rows={14}
                    spellCheck={false}
                    className="font-mono text-xs"
                    onChange={(event) => {
                      setDraft(event.target.value);
                      const parsed = parseProps(event.target.value);
                      setJsonError(parsed.ok ? null : parsed.error);
                    }}
                  />
                  {jsonError !== null && (
                    <p role="alert" className="text-destructive text-sm">
                      {jsonError}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm">
                    {blockPropsHint(section.type)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={isBusy || jsonError !== null}
                      onClick={() => void save(section)}
                    >
                      <Save className="size-4" /> Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isBusy}
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
