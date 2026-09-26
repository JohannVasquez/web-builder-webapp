'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, TriangleAlert, XCircle } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';
import { AdminPagesSchema } from '../domain/AdminApi';
import {
  SiteQualityReviewResponseSchema,
  mergeObservations,
} from '../application/siteQualityReview';
import type { SiteQualityObservation } from '@/modules/SiteQualityReview/domain/SiteQualityObservation';

interface SiteQualityReviewPanelProps {
  readonly tenantId: string;
}

export function SiteQualityReviewPanel({ tenantId }: SiteQualityReviewPanelProps): ReactElement {
  const api = useAdminApi();
  const [runCount, setRunCount] = useState(0);

  // runCount en la clave hace que refreshAsyncData dispare una nueva carga al incrementarlo.
  const reviewKey = `admin:tenant:${tenantId}:quality-review:${runCount}`;
  const pagesKey = `admin:tenant:${tenantId}:pages`;

  const reviewData = useAsyncData(reviewKey, async () => {
    return api.get(
      `/api/admin/tenants/${tenantId}/quality-review`,
      SiteQualityReviewResponseSchema,
    );
  });

  const pagesData = useAsyncData(pagesKey, async () => {
    const { pages } = await api.get(`/api/admin/tenants/${tenantId}/pages`, AdminPagesSchema);
    return pages;
  });

  const isLoading = reviewData.isLoading || pagesData.isLoading;
  const hasError = reviewData.error !== null || pagesData.error !== null;
  const errorMessage = reviewData.error ?? pagesData.error;

  const observations: SiteQualityObservation[] =
    reviewData.data !== null && pagesData.data !== null
      ? mergeObservations(reviewData.data.observations, pagesData.data)
      : [];

  const hasResults = reviewData.data !== null && pagesData.data !== null;

  const handleRunAgain = (): void => {
    // Incrementar el contador cambia la clave y provoca una nueva llamada a la API.
    setRunCount((n) => n + 1);
    refreshAsyncData(pagesKey);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clientes/${tenantId}`}
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Volver al cliente
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="ui-heading text-2xl">Revisión de calidad</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Observaciones del sitio antes de entregarlo al cliente. No modifica nada.
            </p>
          </div>
          {hasResults && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={handleRunAgain}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Correr revisión de nuevo
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Revisando sitio...
        </p>
      )}

      {!isLoading && hasError && (
        <p role="alert" className="text-destructive">
          {errorMessage ?? 'Error al cargar la revisión.'}
        </p>
      )}

      {!isLoading && !hasError && hasResults && observations.length === 0 && (
        <SiteReadyMessage />
      )}

      {!isLoading && !hasError && hasResults && observations.length > 0 && (
        <ObservationList observations={observations} />
      )}
    </div>
  );
}

function SiteReadyMessage(): ReactElement {
  return (
    <div
      className="ui-card flex flex-col items-center gap-3 p-8 text-center"
      role="status"
      aria-label="El sitio está listo para entregar"
    >
      <CheckCircle2 className="size-10 text-emerald-500" aria-hidden="true" />
      <p className="font-semibold text-lg">El sitio está listo para entregar</p>
      <p className="text-muted-foreground text-sm max-w-md">
        No se encontraron observaciones. Puedes entregar el sitio al cliente con confianza.
      </p>
    </div>
  );
}

interface ObservationListProps {
  readonly observations: readonly SiteQualityObservation[];
}

function ObservationList({ observations }: ObservationListProps): ReactElement {
  const blocking = observations.filter((o) => o.severity === 'blocking');
  const improvable = observations.filter((o) => o.severity === 'improvable');

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        {observations.length === 1
          ? '1 observación encontrada.'
          : `${observations.length} observaciones encontradas.`}
      </p>

      {blocking.length > 0 && (
        <section aria-labelledby="blocking-heading">
          <h2
            id="blocking-heading"
            className="ui-heading mb-3 flex items-center gap-2 text-lg text-destructive"
          >
            <XCircle className="size-5" aria-hidden="true" />
            <span>Impiden entregar</span>
            <span className="sr-only">({blocking.length})</span>
          </h2>
          <ul className="space-y-3">
            {blocking.map((obs, i) => (
              <ObservationCard key={i} observation={obs} />
            ))}
          </ul>
        </section>
      )}

      {improvable.length > 0 && (
        <section aria-labelledby="improvable-heading">
          <h2
            id="improvable-heading"
            className="ui-heading mb-3 flex items-center gap-2 text-lg"
          >
            <TriangleAlert className="size-5 text-amber-500" aria-hidden="true" />
            <span>Mejorables</span>
            <span className="sr-only">({improvable.length})</span>
          </h2>
          <ul className="space-y-3">
            {improvable.map((obs, i) => (
              <ObservationCard key={i} observation={obs} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

interface ObservationCardProps {
  readonly observation: SiteQualityObservation;
}

function ObservationCard({ observation }: ObservationCardProps): ReactElement {
  const isBlocking = observation.severity === 'blocking';

  return (
    <li
      className={`ui-card p-5 space-y-3 ${isBlocking ? 'border-destructive' : ''}`}
      // Permite distinguir la gravedad sin depender del color.
      aria-label={`${isBlocking ? 'Observación bloqueante' : 'Observación mejorable'}: ${observation.what}`}
    >
      <div className="flex items-start gap-3">
        {isBlocking ? (
          <XCircle
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
        ) : (
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-amber-500"
            aria-hidden="true"
          />
        )}
        <div className="min-w-0 space-y-1">
          <p className="font-semibold leading-snug">{observation.what}</p>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium">Dónde:</span> {observation.where}
          </p>
        </div>
      </div>

      <div className="rounded-md bg-muted px-4 py-3 text-sm">
        <span className="font-medium">Cómo se arregla:</span> {observation.fix}
      </div>

      {/* Texto solo para lectores de pantalla que nombra la gravedad sin depender del color */}
      <p className="sr-only">
        {isBlocking
          ? 'Esta observación impide entregar el sitio y debe resolverse antes de la entrega.'
          : 'Esta observación es mejorable; no impide la entrega pero vale la pena corregirla.'}
      </p>
    </li>
  );
}

