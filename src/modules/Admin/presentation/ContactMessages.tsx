'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader2, Mail, MailOpen, TriangleAlert } from 'lucide-react';
import {
  ContactMessageResponseSchema,
  ContactMessagesSchema,
  SubscribersSchema,
  type ContactMessage,
} from '../domain/AdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { Button } from '@/shared/ui/button';

interface ContactMessagesProps {
  readonly tenantId: string;
}

const PAGE_SIZE = 50;

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });

// La descarga exige el token en `Authorization`, así que un `<a href>` normal no
// autentica: se pide el archivo por fetch y se dispara la descarga desde el blob.
const downloadFile = async (
  url: string,
  token: string | null,
  filename: string,
): Promise<void> => {
  const response = await fetch(url, {
    headers: token === null ? {} : { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('No pudimos descargar el archivo.');
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

export function ContactMessages({ tenantId }: ContactMessagesProps): ReactElement {
  const api = useAdminApi();
  const { token } = useSession();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [offset, setOffset] = useState(0);

  const messagesKey = `admin:tenant:${tenantId}:messages:${String(unreadOnly)}:${String(offset)}`;
  const messages = useAsyncData(messagesKey, async () => {
    const query = new URLSearchParams({
      unreadOnly: String(unreadOnly),
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    return api.get(
      `/api/admin/tenants/${tenantId}/messages?${query.toString()}`,
      ContactMessagesSchema,
    );
  });

  const subscribersKey = `admin:tenant:${tenantId}:subscribers`;
  const subscribers = useAsyncData(subscribersKey, async () => {
    return api.get(`/api/admin/tenants/${tenantId}/subscribers`, SubscribersSchema);
  });

  const toggleFilter = (): void => {
    setUnreadOnly((current) => !current);
    setOffset(0);
  };

  const markRead = async (message: ContactMessage): Promise<void> => {
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/messages/${String(message.id)}`,
        { read: message.readAt === null },
        ContactMessageResponseSchema,
      );
      refreshAsyncData(messagesKey);
    } catch (cause) {
      toast.error(
        describeAdminError(
          cause,
          'No pudimos actualizar el mensaje. Inténtalo nuevamente.',
        ).message,
      );
    }
  };

  const exportMessages = async (): Promise<void> => {
    try {
      await downloadFile(
        `${getPublicApiBaseUrl()}/api/admin/tenants/${tenantId}/messages/export.csv`,
        token,
        'mensajes.csv',
      );
    } catch {
      toast.error('No pudimos descargar los mensajes. Inténtalo nuevamente.');
    }
  };

  const exportSubscribers = async (): Promise<void> => {
    try {
      await downloadFile(
        `${getPublicApiBaseUrl()}/api/admin/tenants/${tenantId}/subscribers/export.csv`,
        token,
        'suscriptores.csv',
      );
    } catch {
      toast.error('No pudimos descargar los suscriptores. Inténtalo nuevamente.');
    }
  };

  const total = messages.data?.total ?? 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrevious = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/clientes/${tenantId}`}
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Volver al cliente
        </Link>
        <h1 className="ui-heading text-2xl">Mensajes de contacto</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unreadOnly} onChange={toggleFilter} />
          Solo no leídos
        </label>
        <Button type="button" variant="outline" onClick={() => void exportMessages()}>
          <Download className="size-4" /> Descargar CSV
        </Button>
      </div>

      {messages.error !== null && (
        <p role="alert" className="text-destructive">
          {messages.error}
        </p>
      )}

      {messages.error === null && (messages.isLoading || messages.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando mensajes...
        </p>
      )}

      {messages.data !== null && messages.data.messages.length === 0 && (
        <p className="text-muted-foreground">
          {unreadOnly
            ? 'No hay mensajes sin leer.'
            : 'Este cliente todavía no recibió mensajes de contacto.'}
        </p>
      )}

      {messages.data !== null && messages.data.messages.length > 0 && (
        <ul className="space-y-3">
          {messages.data.messages.map((message) => {
            const isUnread = message.readAt === null;
            return (
              <li
                key={message.id}
                className={`ui-card space-y-2 p-4 ${isUnread ? 'border-primary/50' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      {isUnread ? (
                        <Mail className="text-primary size-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <MailOpen
                          className="text-muted-foreground size-4 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {message.name}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {message.email}
                      {message.phone !== null ? ` · ${message.phone}` : ''}
                    </p>
                  </div>
                  <p className="text-muted-foreground shrink-0 text-xs">
                    {formatDate(message.createdAt)}
                  </p>
                </div>

                <p className="text-sm whitespace-pre-wrap">{message.message}</p>

                {message.emailError !== null && (
                  <p className="flex items-start gap-1.5 text-sm text-amber-700 dark:text-amber-300">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    No pudimos avisar por correo a este cliente: {message.emailError}. El
                    mensaje quedó guardado aquí.
                  </p>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void markRead(message)}
                >
                  {isUnread ? 'Marcar como leído' : 'Marcar como no leído'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {messages.data !== null && messages.data.messages.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            Página {page} de {pageCount} — {total} mensajes
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPrevious}
              onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() =>
                setOffset((current) => (current + PAGE_SIZE < total ? current + PAGE_SIZE : current))
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <section className="space-y-3 border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="ui-heading text-lg">Suscriptores a novedades</h2>
          <Button type="button" variant="outline" onClick={() => void exportSubscribers()}>
            <Download className="size-4" /> Descargar CSV
          </Button>
        </div>

        {subscribers.error !== null && (
          <p role="alert" className="text-destructive">
            {subscribers.error}
          </p>
        )}

        {subscribers.error === null &&
          (subscribers.isLoading || subscribers.data === null) && (
            <p className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Cargando suscriptores...
            </p>
          )}

        {subscribers.data !== null && subscribers.data.subscribers.length === 0 && (
          <p className="text-muted-foreground">Todavía no hay suscriptores.</p>
        )}

        {subscribers.data !== null && subscribers.data.subscribers.length > 0 && (
          <div className="ui-card overflow-x-auto p-0">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-muted-foreground border-b text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Correo</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.data.subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{subscriber.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(subscriber.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {subscriber.unsubscribedAt === null ? 'Suscrito' : 'Dado de baja'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscribers.data.total > subscribers.data.subscribers.length && (
              <p className="text-muted-foreground p-3 text-xs">
                Mostrando {subscribers.data.subscribers.length} de {subscribers.data.total}.
                Descarga el CSV para ver el resto.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
