'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import {
  DataRightsRequestsSchema,
  type DataRightsRequest,
} from '../domain/AdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';

interface DataRightsRequestsProps {
  readonly tenantId: string;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const RIGHT_LABELS: Record<string, string> = {
  acceso: 'Acceso',
  rectificacion: 'Rectificación',
  cancelacion: 'Cancelación',
  oposicion: 'Oposición',
  portabilidad: 'Portabilidad',
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente de verificación',
  verificada: 'En revisión (confirmada)',
  resuelta: 'Resuelta',
  rechazada: 'Rechazada',
};

export function DataRightsRequests({ tenantId }: DataRightsRequestsProps): ReactElement {
  const api = useAdminApi();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const requestsKey = `admin:tenant:${tenantId}:data-rights`;
  const { data, error, isLoading } = useAsyncData(requestsKey, async () => {
    return api.get(`/api/admin/tenants/${tenantId}/solicitudes-datos`, DataRightsRequestsSchema);
  });

  const resolveRequest = async (request: DataRightsRequest, outcome: 'resuelta' | 'rechazada'): Promise<void> => {
    if (outcome === 'resuelta' && request.right === 'cancelacion') {
      const confirmed = window.confirm(
        'Vas a confirmar la cancelación (borrado o anonimización) de los datos de esta persona. Esta acción es irreversible. ¿Continuar?'
      );
      if (!confirmed) return;
    }

    setResolvingId(request.id);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/solicitudes-datos/${request.id}`,
        { outcome },
        z.any()
      );
      
      toast.success(outcome === 'resuelta' ? 'Solicitud resuelta.' : 'Solicitud rechazada.');
      refreshAsyncData(requestsKey);
      setExpandedId(null);
    } catch (cause) {
      toast.error(
        describeAdminError(cause, 'No pudimos actualizar la solicitud. Inténtalo nuevamente.').message
      );
    } finally {
      setResolvingId(null);
    }
  };

  const requests = data?.requests ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/clientes/${tenantId}`}
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Volver al cliente
        </Link>
        <h1 className="ui-heading text-2xl">Solicitudes ARCOP</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Derechos de acceso, rectificación, cancelación, oposición y portabilidad (Ley 21.719).
        </p>
      </div>

      {error !== null && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}

      {error === null && (isLoading || data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando solicitudes...
        </p>
      )}

      {data !== null && requests.length === 0 && (
        <p className="text-muted-foreground">Este cliente no tiene solicitudes ARCOP.</p>
      )}

      {data !== null && requests.length > 0 && (
        <ul className="space-y-4">
          {requests.map((request) => {
            const isOverdue = request.status !== 'resuelta' && request.status !== 'rechazada' && new Date() > new Date(request.dueAt);
            const isExpanded = expandedId === request.id;
            const isPendingAction = request.status === 'verificada';

            return (
              <li
                key={request.id}
                className={`ui-card p-5 ${isOverdue ? 'border-destructive bg-destructive/5' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="ui-heading text-lg font-semibold">
                        {RIGHT_LABELS[request.right]}
                      </h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        request.status === 'resuelta' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        request.status === 'rechazada' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {STATUS_LABELS[request.status]}
                      </span>
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-destructive text-sm font-semibold ml-2">
                          <ShieldAlert className="size-4" aria-hidden="true" />
                          <span className="sr-only">Atención: </span>
                          Vencida
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      {request.email}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">
                      Recibida: {formatDate(request.createdAt)}
                    </p>
                    <p className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      Vence: {formatDate(request.dueAt)}
                    </p>
                  </div>
                </div>

                {!isExpanded ? (
                  <div className="mt-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => setExpandedId(request.id)}>
                      Ver detalles
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    {request.details && (
                      <div>
                        <h3 className="font-medium text-sm">Detalles de la solicitud:</h3>
                        <p className="text-sm mt-1 bg-muted p-3 rounded-md whitespace-pre-wrap">
                          {request.details}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {isPendingAction && (
                        <>
                          <Button
                            type="button"
                            disabled={resolvingId === request.id}
                            onClick={() => void resolveRequest(request, 'resuelta')}
                          >
                            {resolvingId === request.id && <Loader2 className="size-4 animate-spin mr-2" />}
                            Marcar como resuelta
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={resolvingId === request.id}
                            onClick={() => void resolveRequest(request, 'rechazada')}
                          >
                            {resolvingId === request.id && <Loader2 className="size-4 animate-spin mr-2" />}
                            Rechazar solicitud
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setExpandedId(null)}
                      >
                        Ocultar detalles
                      </Button>
                    </div>
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
