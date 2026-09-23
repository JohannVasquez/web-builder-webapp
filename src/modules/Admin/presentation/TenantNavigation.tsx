'use client';

import Link from 'next/link';
import { useState, type DragEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import {
  AdminPagesSchema,
  NavigationLinksSchema,
  type AdminPage,
} from '../domain/AdminApi';
import {
  describeNavigationIssuePath,
  moveLinkDown,
  moveLinkUp,
  pageHref,
  reorderLinksByDrag,
  validateNavLinkHref,
  validateNavLinkLabel,
  type NavLinkDraft,
} from '../application/navigationForm';
import {
  describeAdminError,
  type AdminErrorMessage,
} from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface TenantNavigationProps {
  readonly tenantId: string;
}

export interface NavLinkRowErrors {
  readonly label: string | null;
  readonly href: string | null;
}

export interface NavigationLinkListProps {
  readonly links: readonly NavLinkDraft[];
  readonly errors: readonly NavLinkRowErrors[];
  readonly pages: readonly AdminPage[];
  readonly isBusy: boolean;
  readonly dragOverIndex: number | null;
  readonly onLabelChange: (index: number, value: string) => void;
  readonly onHrefChange: (index: number, value: string) => void;
  readonly onSelectPage: (index: number, slug: string) => void;
  readonly onMoveUp: (index: number) => void;
  readonly onMoveDown: (index: number) => void;
  readonly onRemove: (index: number) => void;
  readonly onDragStart: (index: number) => void;
  readonly onDragOver: (index: number, event: DragEvent<HTMLLIElement>) => void;
  readonly onDrop: (index: number, event: DragEvent<HTMLLIElement>) => void;
  readonly onDragEnd: () => void;
}

// Lista de enlaces del menú (Pantalla 5). Sin hooks propios, para poder probarla con
// `renderToStaticMarkup` igual que `SectionList`, `UserList` y `DomainList`.
export function NavigationLinkList({
  links,
  errors,
  pages,
  isBusy,
  dragOverIndex,
  onLabelChange,
  onHrefChange,
  onSelectPage,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: NavigationLinkListProps): ReactElement {
  if (links.length === 0) {
    return <p className="text-muted-foreground">Este menú todavía no tiene enlaces.</p>;
  }

  return (
    <ol className="space-y-3">
      {links.map((link, index) => {
        const rowErrors = errors[index] ?? { label: null, href: null };
        return (
          <li
            key={index}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(event) => onDragOver(index, event)}
            onDrop={(event) => onDrop(index, event)}
            onDragEnd={onDragEnd}
            className={`ui-card space-y-3 p-4 transition-colors ${
              dragOverIndex === index ? 'border-primary' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <GripVertical
                aria-hidden="true"
                className="text-muted-foreground mt-6 size-4 shrink-0 cursor-grab"
              />
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`nav-label-${String(index)}`}>Texto</Label>
                  <Input
                    id={`nav-label-${String(index)}`}
                    value={link.label}
                    disabled={isBusy}
                    onChange={(event) => onLabelChange(index, event.target.value)}
                    placeholder="Ej. Servicios"
                  />
                  {rowErrors.label !== null && (
                    <p role="alert" className="text-destructive text-xs">
                      {rowErrors.label}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`nav-href-${String(index)}`}>Enlace</Label>
                  <Input
                    id={`nav-href-${String(index)}`}
                    value={link.href}
                    disabled={isBusy}
                    onChange={(event) => onHrefChange(index, event.target.value)}
                    placeholder="/servicios, /servicios#precios o https://..."
                  />
                  {rowErrors.href !== null && (
                    <p role="alert" className="text-destructive text-xs">
                      {rowErrors.href}
                    </p>
                  )}
                  {pages.length > 0 && (
                    <select
                      aria-label="Elegir una página existente"
                      className="ui-input h-8 w-full px-2 text-xs"
                      disabled={isBusy}
                      value=""
                      onChange={(event) => {
                        if (event.target.value !== '') {
                          onSelectPage(index, event.target.value);
                        }
                      }}
                    >
                      <option value="">O elige una página existente…</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.slug}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Subir enlace"
                disabled={isBusy || index === 0}
                onClick={() => onMoveUp(index)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Bajar enlace"
                disabled={isBusy || index === links.length - 1}
                onClick={() => onMoveDown(index)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Quitar enlace"
                disabled={isBusy}
                onClick={() => onRemove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function TenantNavigation({ tenantId }: TenantNavigationProps): ReactElement {
  const api = useAdminApi();
  const navigationCacheKey = `admin:tenant:${tenantId}:navigation`;
  const pagesCacheKey = `admin:tenant:${tenantId}:pages`;

  const navigation = useAsyncData(navigationCacheKey, async () => {
    const { links } = await api.get(
      `/api/admin/tenants/${tenantId}/navigation`,
      NavigationLinksSchema,
    );
    return links;
  });
  const pages = useAsyncData(pagesCacheKey, async () => {
    const { pages: list } = await api.get(
      `/api/admin/tenants/${tenantId}/pages`,
      AdminPagesSchema,
    );
    return list;
  });

  const [draft, setDraft] = useState<NavLinkDraft[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<AdminErrorMessage | null>(null);

  const links = draft ?? navigation.data ?? [];
  const isDirty = draft !== null;
  useUnsavedChangesGuard(isDirty);

  const update = (updater: (current: NavLinkDraft[]) => NavLinkDraft[]): void => {
    setDraft(updater([...links]));
  };

  const rowErrors: NavLinkRowErrors[] = links.map((link) => {
    const labelError = validateNavLinkLabel(link.label);
    const hrefError = validateNavLinkHref(link.href);
    const showLabelError =
      labelError !== null && (hasTriedSave || link.label.trim() !== '');
    const showHrefError = hrefError !== null && (hasTriedSave || link.href.trim() !== '');
    return {
      label: showLabelError ? labelError : null,
      href: showHrefError ? hrefError : null,
    };
  });

  const handleDiscard = (): void => {
    if (isDirty && !window.confirm('¿Descartar los cambios del menú?')) {
      return;
    }
    setDraft(null);
    setHasTriedSave(false);
    setSubmitError(null);
  };

  const handleSave = async (): Promise<void> => {
    setHasTriedSave(true);
    const anyInvalid = links.some(
      (link) =>
        validateNavLinkLabel(link.label) !== null ||
        validateNavLinkHref(link.href) !== null,
    );
    if (anyInvalid) {
      toast.error('Revisa los enlaces marcados en rojo.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const payload = links.map((link) => ({
        label: link.label.trim(),
        href: link.href.trim(),
      }));
      await api.put(
        `/api/admin/tenants/${tenantId}/navigation`,
        { links: payload },
        NavigationLinksSchema,
      );
      refreshAsyncData(navigationCacheKey);
      setDraft(null);
      setHasTriedSave(false);
      toast.success('Menú actualizado.');
    } catch (cause) {
      const described = describeAdminError(
        cause,
        'No pudimos guardar el menú. Inténtalo nuevamente.',
      );
      setSubmitError(described);
      toast.error(described.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (navigation.error !== null) {
    return (
      <p role="alert" className="text-destructive">
        {navigation.error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clientes/${tenantId}`}
          className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Volver al cliente
        </Link>
        <h1 className="ui-heading text-2xl">Menú de navegación</h1>
        <p className="text-muted-foreground text-sm">
          El orden de esta lista es el orden en que aparecen los enlaces en el sitio. Un
          enlace puede apuntar a una página propia (/nosotros), al ancla de una sección
          (/servicios#precios) o a una URL completa.
        </p>
      </div>

      {navigation.isLoading || navigation.data === null ? (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando menú...
        </p>
      ) : (
        <>
          <NavigationLinkList
            links={links}
            errors={rowErrors}
            pages={pages.data ?? []}
            isBusy={isSaving}
            dragOverIndex={dragOverIndex}
            onLabelChange={(index, value) =>
              update((current) =>
                current.map((link, i) =>
                  i === index ? { ...link, label: value } : link,
                ),
              )
            }
            onHrefChange={(index, value) =>
              update((current) =>
                current.map((link, i) => (i === index ? { ...link, href: value } : link)),
              )
            }
            onSelectPage={(index, slug) =>
              update((current) =>
                current.map((link, i) =>
                  i === index ? { ...link, href: pageHref(slug) } : link,
                ),
              )
            }
            onMoveUp={(index) => update((current) => moveLinkUp(current, index))}
            onMoveDown={(index) => update((current) => moveLinkDown(current, index))}
            onRemove={(index) =>
              update((current) => current.filter((_, i) => i !== index))
            }
            onDragStart={(index) => setDragIndex(index)}
            onDragOver={(index, event) => {
              event.preventDefault();
              if (dragIndex !== null && dragIndex !== index) {
                setDragOverIndex(index);
              }
            }}
            onDrop={(index, event) => {
              event.preventDefault();
              const from = dragIndex;
              setDragIndex(null);
              setDragOverIndex(null);
              if (from === null || from === index) {
                return;
              }
              update((current) => reorderLinksByDrag(current, from, index));
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
          />

          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => update((current) => [...current, { label: '', href: '' }])}
          >
            <Plus className="size-4" /> Agregar enlace
          </Button>

          {submitError !== null && (
            <div role="alert" className="text-destructive space-y-1 text-sm">
              <p>{submitError.message}</p>
              {submitError.issues.length > 0 && (
                <ul className="list-disc pl-5">
                  {submitError.issues.map((issue) => (
                    <li key={issue.path}>
                      {describeNavigationIssuePath(issue.path)}: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={isSaving || !isDirty}
              onClick={() => void handleSave()}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Guardar menú
            </Button>
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleDiscard}
              >
                Descartar cambios
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
