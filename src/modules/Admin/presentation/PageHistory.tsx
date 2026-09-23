'use client';

import { useState, type ReactElement } from 'react';
import { History, Loader2, RotateCcw } from 'lucide-react';
import { PageVersionsSchema, type PageVersion } from '../domain/AdminApi';
import { describeVersionActor, formatVersionDate } from '../application/versionPresentation';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';

interface VersionListProps {
  readonly versions: readonly PageVersion[];
  readonly isBusy: boolean;
  readonly onRestore: (versionId: string) => void;
}

// Puro y exportado para poder probarlo con `renderToStaticMarkup`, sin red ni sesión.
export function VersionList({
  versions,
  isBusy,
  onRestore,
}: VersionListProps): ReactElement {
  if (versions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Todavía no hay cambios guardados en esta página.
      </p>
    );
  }

  return (
    <ul className="divide-border divide-y">
      {versions.map((version, index) => (
        <li key={version.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{version.summary}</p>
            <p className="text-muted-foreground text-xs">
              {describeVersionActor(version)} · {formatVersionDate(version.createdAt)}
              {index === 0 ? ' · estado actual' : ''}
            </p>
          </div>
          {index === 0 ? null : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => {
                onRestore(version.id);
              }}
            >
              <RotateCcw className="size-4" /> Restaurar
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}

interface PageHistoryProps {
  readonly tenantId: string;
  readonly pageId: string;
  readonly isBusy: boolean;
  readonly onRestore: (versionId: string) => Promise<void>;
}

export function PageHistory({
  tenantId,
  pageId,
  isBusy,
  onRestore,
}: PageHistoryProps): ReactElement {
  const api = useAdminApi();
  const [isOpen, setIsOpen] = useState(false);
  const cacheKey = `admin:tenant:${tenantId}:page:${pageId}:versions`;

  const versions = useAsyncData(cacheKey, async () => {
    const { versions: list } = await api.get(
      `/api/admin/tenants/${tenantId}/pages/${pageId}/versions?limit=30`,
      PageVersionsSchema,
    );
    return list;
  });

  const restore = (versionId: string): void => {
    // Restaurar reemplaza el borrador, no el sitio: por eso se avisa que hay que publicar.
    if (
      !window.confirm(
        'Vas a reemplazar el borrador de esta página por esa versión. Para que el cambio se vea en el sitio tienes que publicar después. ¿Seguimos?',
      )
    ) {
      return;
    }
    void onRestore(versionId).then(() => {
      refreshAsyncData(cacheKey);
    });
  };

  return (
    <section className="ui-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="ui-heading flex items-center gap-2 text-base">
          <History className="size-4" /> Historial
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
        >
          {isOpen ? 'Ocultar' : 'Ver cambios'}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4">
          {versions.error !== null ? (
            <p role="alert" className="text-destructive text-sm">
              {versions.error}
            </p>
          ) : versions.isLoading || versions.data === null ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Cargando el historial...
            </p>
          ) : (
            <VersionList
              versions={versions.data}
              isBusy={isBusy}
              onRestore={restore}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
