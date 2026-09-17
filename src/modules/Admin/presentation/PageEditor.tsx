'use client';

import Link from 'next/link';
import { useState, type DragEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Loader2,
  Menu as MenuIcon,
  Monitor,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import {
  AdminPageResponseSchema,
  AdminPagesSchema,
  TenantsSchema,
  type AdminSection,
} from '../domain/AdminApi';
import { groupBlockCatalog, findBlockCatalogEntry } from '../domain/blockCatalog';
import { blockPropsHint } from '../domain/blockHints';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  dropPlacement,
  moveSectionDown,
  moveSectionUp,
  reorderByDrag,
} from '../application/sectionOrdering';
import { formatProps, parseProps } from '../application/propsEditor';
import { useAdminApi } from './useAdminApi';
import { BlockThumbnail } from './BlockThumbnail';
import { PagePreview } from './PagePreview';
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

const labelFor = (type: string): string => findBlockCatalogEntry(type)?.label ?? type;

export interface SectionListProps {
  readonly sections: readonly AdminSection[];
  readonly editingId: number | null;
  readonly draft: string;
  readonly jsonError: string | null;
  readonly isBusy: boolean;
  readonly dragOverId: number | null;
  readonly onDragStart: (section: AdminSection, event: DragEvent<HTMLLIElement>) => void;
  readonly onDragOver: (section: AdminSection, event: DragEvent<HTMLLIElement>) => void;
  readonly onDrop: (section: AdminSection, event: DragEvent<HTMLLIElement>) => void;
  readonly onDragEnd: () => void;
  readonly onMoveUp: (section: AdminSection) => void;
  readonly onMoveDown: (section: AdminSection) => void;
  readonly onDuplicate: (section: AdminSection) => void;
  readonly onToggleHidden: (section: AdminSection) => void;
  readonly onStartEdit: (section: AdminSection) => void;
  readonly onDelete: (section: AdminSection) => void;
  readonly onDraftChange: (value: string) => void;
  readonly onSave: (section: AdminSection) => void;
  readonly onCancelEdit: () => void;
}

// Lista de bloques de una página. Sin hooks propios (todo el estado llega por props) para
// poder probarla con `renderToStaticMarkup`, igual que `UserList` y `DomainList`.
export function SectionList({
  sections,
  editingId,
  draft,
  jsonError,
  isBusy,
  dragOverId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleHidden,
  onStartEdit,
  onDelete,
  onDraftChange,
  onSave,
  onCancelEdit,
}: SectionListProps): ReactElement {
  if (sections.length === 0) {
    return (
      <p className="text-muted-foreground">
        Esta página no tiene bloques todavía. Agrega el primero con el botón de arriba.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {sections.map((section, index) => (
        <li
          key={section.id}
          draggable
          onDragStart={(event) => onDragStart(section, event)}
          onDragOver={(event) => onDragOver(section, event)}
          onDrop={(event) => onDrop(section, event)}
          onDragEnd={onDragEnd}
          className={`ui-card space-y-1 p-4 transition-colors ${
            section.isHidden ? 'opacity-60' : ''
          } ${dragOverId === section.id ? 'border-primary' : ''}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              <GripVertical
                aria-hidden="true"
                className="text-muted-foreground mt-1 size-4 shrink-0 cursor-grab"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{labelFor(section.type)}</p>
                  {section.isHidden && (
                    <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground truncate text-sm">
                  {summarize(section)}
                </p>
                {section.isHidden && (
                  <p className="text-muted-foreground text-xs">
                    Sigue en el borrador, pero no sale en el sitio publicado.
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Subir bloque"
                disabled={isBusy || index === 0}
                onClick={() => onMoveUp(section)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Bajar bloque"
                disabled={isBusy || index === sections.length - 1}
                onClick={() => onMoveDown(section)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Duplicar bloque"
                disabled={isBusy}
                onClick={() => onDuplicate(section)}
              >
                <Copy className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={section.isHidden ? 'Mostrar bloque' : 'Ocultar bloque'}
                disabled={isBusy}
                onClick={() => onToggleHidden(section)}
              >
                {section.isHidden ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
                {section.isHidden ? 'Mostrar' : 'Ocultar'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartEdit(section)}
                disabled={isBusy}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Eliminar bloque"
                disabled={isBusy}
                onClick={() => onDelete(section)}
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
                onChange={(event) => onDraftChange(event.target.value)}
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
                  onClick={() => onSave(section)}
                >
                  <Save className="size-4" /> Guardar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isBusy}
                  onClick={onCancelEdit}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export function PageEditor({ tenantId, pageId }: PageEditorProps): ReactElement {
  const api = useAdminApi();
  const base = `/api/admin/tenants/${tenantId}/pages/${pageId}`;
  const cacheKey = `admin:tenant:${tenantId}:page:${pageId}`;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

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

  // El sitio público sirve `publishedContent` (una foto de este borrador tomada al
  // publicar), no las secciones en vivo: sin este botón, agregar/mover/ocultar bloques
  // nunca llegaría al sitio, sin importar cuántas veces se apriete "Publicar" en la lista
  // de páginas (ese PATCH solo cambia si la página es visible, no actualiza la foto).
  const publish = async (): Promise<void> => {
    await run(
      () => api.post(`${base}/publish`, {}, AdminPageResponseSchema),
      'Cambios publicados.',
    );
  };

  const duplicate = async (section: AdminSection): Promise<void> => {
    await run(
      () =>
        api.post(
          `${base}/sections/${String(section.id)}/duplicate`,
          {},
          AdminPageResponseSchema,
        ),
      'Bloque duplicado.',
    );
  };

  const toggleHidden = async (section: AdminSection): Promise<void> => {
    await run(
      () =>
        api.patch(
          `${base}/sections/${String(section.id)}`,
          { isHidden: !section.isHidden },
          AdminPageResponseSchema,
        ),
      section.isHidden ? 'El bloque vuelve a mostrarse.' : 'Bloque ocultado.',
    );
  };

  const handleDragStart = (section: AdminSection): void => {
    setDraggedId(section.id);
  };

  const handleDragOver = (
    section: AdminSection,
    event: DragEvent<HTMLLIElement>,
  ): void => {
    event.preventDefault();
    if (draggedId !== null && draggedId !== section.id) {
      setDragOverId(section.id);
    }
  };

  const handleDrop = (
    section: AdminSection,
    event: DragEvent<HTMLLIElement>,
    ids: readonly number[],
  ): void => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = rect.height === 0 ? 0 : (event.clientY - rect.top) / rect.height;
    const dragged = draggedId;
    setDraggedId(null);
    setDragOverId(null);
    if (dragged === null) {
      return;
    }
    const nextIds = reorderByDrag(ids, dragged, section.id, dropPlacement(ratio));
    if (nextIds.join(',') !== ids.join(',')) {
      void reorder(nextIds);
    }
  };

  const handleDragEnd = (): void => {
    setDraggedId(null);
    setDragOverId(null);
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
  // La `position` solo ordena, no tiene por qué empezar en 0 ni ser contigua (el seed de
  // datos usa 1, 2, 3...). Un bloque nuevo va después de la más alta que exista, nunca en
  // `sections.length`: en una página ya sembrada esa posición puede estar ocupada.
  const nextPosition =
    sections.reduce((max, section) => Math.max(max, section.position), -1) + 1;
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
        <div className="flex flex-wrap items-center gap-2">
          {tenant?.primaryDomain != null && (
            <a
              href={`http://${tenant.primaryDomain}${previewPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
            >
              Abrir sitio publicado <ExternalLink className="size-3.5" />
            </a>
          )}
          <Button
            variant="outline"
            onClick={() => setShowPreview((open) => !open)}
            disabled={isBusy}
          >
            <Monitor className="size-4" /> Vista previa
          </Button>
          <Button variant="outline" onClick={() => void publish()} disabled={isBusy}>
            <UploadCloud className="size-4" />
            {page.data.isPublished ? 'Publicar cambios' : 'Publicar página'}
          </Button>
          <Button onClick={() => setShowCatalog((open) => !open)} disabled={isBusy}>
            <Plus className="size-4" /> Agregar bloque
          </Button>
        </div>
      </div>

      {showPreview && (
        <div className="ui-card p-4">
          <PagePreview
            primaryDomain={tenant?.primaryDomain ?? null}
            previewPath={previewPath}
          />
        </div>
      )}

      {showCatalog && (
        <div className="ui-card space-y-5 p-4">
          <h2 className="ui-heading text-lg">Catálogo de bloques</h2>
          {groupBlockCatalog().map((group) => (
            <div key={group.family} className="space-y-2">
              <h3 className="text-muted-foreground text-sm font-medium">{group.label}</h3>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {group.entries.map((entry) => (
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
                              { type: entry.type, position: nextPosition, props: {} },
                              AdminPageResponseSchema,
                            ),
                          `Bloque "${entry.label}" agregado.`,
                        );
                      }}
                      className="hover:bg-accent w-full space-y-2 rounded-md border p-3 text-left transition-colors disabled:opacity-50"
                    >
                      <BlockThumbnail type={entry.type} />
                      <span className="block font-medium">{entry.label}</span>
                      <span className="text-muted-foreground block text-xs">
                        {entry.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <SectionList
        sections={sections}
        editingId={editingId}
        draft={draft}
        jsonError={jsonError}
        isBusy={isBusy}
        dragOverId={dragOverId}
        onDragStart={(section) => handleDragStart(section)}
        onDragOver={(section, event) => handleDragOver(section, event)}
        onDrop={(section, event) => handleDrop(section, event, ids)}
        onDragEnd={handleDragEnd}
        onMoveUp={(section) => void reorder(moveSectionUp(ids, section.id))}
        onMoveDown={(section) => void reorder(moveSectionDown(ids, section.id))}
        onDuplicate={(section) => void duplicate(section)}
        onToggleHidden={(section) => void toggleHidden(section)}
        onStartEdit={startEditing}
        onDelete={(section) => {
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
        onDraftChange={(value) => {
          setDraft(value);
          const parsed = parseProps(value);
          setJsonError(parsed.ok ? null : parsed.error);
        }}
        onSave={(section) => void save(section)}
        onCancelEdit={() => setEditingId(null)}
      />

      <Link
        href={`/clientes/${tenantId}/menu`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <MenuIcon className="size-4" /> Editar el menú de navegación del sitio
      </Link>
    </div>
  );
}
