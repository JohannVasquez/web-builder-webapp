'use client';

import Link from 'next/link';
import { useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  ConvertDemoResponseSchema,
  type ConvertDemoResponse,
  type Demo,
  type DemoDiscardReason,
} from '../domain/DemoApi';
import { AdminApiError } from '../application/AdminApiClient';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  DISCARD_REASON_OPTIONS,
  defaultClientSlug,
  describeInvitation,
} from '../application/demoPresentation';
import {
  buildConvertPayload,
  validateConvertForm,
  type FormProblem,
} from '../application/demoForm';
import { useAdminApi } from './useAdminApi';
import { DemoDialog } from './DemoDialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

// Los dos finales de una demo: el prospecto dijo que no (descartar) o compró (convertir).

export function DiscardDemoDialog({
  isPending,
  onClose,
  onDiscard,
}: {
  readonly isPending: boolean;
  readonly onClose: () => void;
  readonly onDiscard: (reason: DemoDiscardReason | null) => void;
}): ReactElement {
  const [reason, setReason] = useState<DemoDiscardReason | ''>('');
  return (
    <DemoDialog title="Descartar la demo" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onDiscard(reason === '' ? null : reason);
        }}
      >
        <p className="text-muted-foreground text-sm">
          El prospecto deja de poder abrirla; el equipo la sigue viendo. Se borra sola a
          los 30 días, y hasta entonces puedes recuperarla con el mismo enlace.
        </p>
        <div className="space-y-2">
          <Label htmlFor="discard-reason">Motivo (opcional)</Label>
          <select
            id="discard-reason"
            className="ui-input h-10 w-full px-2 text-base sm:text-sm"
            value={reason}
            onChange={(event) => setReason(event.target.value as DemoDiscardReason | '')}
          >
            <option value="">Sin motivo</option>
            {DISCARD_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />} Descartar demo
          </Button>
        </div>
      </form>
    </DemoDialog>
  );
}

export function ConvertDemoDialog({
  demo,
  openSiblingCount,
  onClose,
  onConverted,
}: {
  readonly demo: Demo;
  readonly openSiblingCount: number;
  readonly onClose: () => void;
  readonly onConverted: (result: ConvertDemoResponse) => void;
}): ReactElement {
  const api = useAdminApi();
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [problem, setProblem] = useState<FormProblem | null>(null);
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultSlug = demo.site == null ? '' : defaultClientSlug(demo.site.slug);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSuggestedSlug(null);
    const values = { slug, ownerName, ownerEmail };
    const invalid = validateConvertForm(values);
    setProblem(invalid);
    if (invalid !== null) {
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await api.post(
        `/api/admin/demos/${demo.id}/convert`,
        buildConvertPayload(values),
        ConvertDemoResponseSchema,
      );
      toast.success('¡Demo convertida en cliente!');
      onConverted(result);
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.suggestedSlug !== null) {
        setSuggestedSlug(cause.suggestedSlug);
      }
      setProblem({
        field: null,
        message: describeAdminError(
          cause,
          'No pudimos convertir la demo. Inténtalo nuevamente.',
        ).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DemoDialog title="Convertir en cliente" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>
            El sitio pasa a ser público, sin vencimiento, en su dirección definitiva.
          </li>
          <li>Los enlaces de la demo dejan de funcionar: ya no hacen falta.</li>
          <li>
            {openSiblingCount === 0
              ? 'Si este prospecto tuviera otras propuestas abiertas, se descartarían.'
              : openSiblingCount === 1
                ? 'La otra propuesta abierta de este prospecto se descartará.'
                : `Las otras ${String(openSiblingCount)} propuestas abiertas de este prospecto se descartarán.`}
          </li>
        </ul>
        <div className="space-y-2">
          <Label htmlFor="convert-slug">Dirección definitiva (opcional)</Label>
          <Input
            id="convert-slug"
            value={slug}
            placeholder={defaultSlug}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={problem?.field === 'slug' || suggestedSlug !== null}
            onChange={(event) => setSlug(event.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            Vacío: {defaultSlug === '' ? 'la de la demo sin "demo-"' : `"${defaultSlug}"`}
            .
          </p>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Dueño del negocio (opcional)</legend>
          <p className="text-muted-foreground text-xs">
            Con nombre y correo le creamos su cuenta y le enviamos un correo para que
            elija su contraseña.
          </p>
          <div className="space-y-2">
            <Label htmlFor="convert-owner-name">Nombre</Label>
            <Input
              id="convert-owner-name"
              value={ownerName}
              autoComplete="off"
              aria-invalid={problem?.field === 'ownerName'}
              onChange={(event) => setOwnerName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="convert-owner-email">Correo</Label>
            <Input
              id="convert-owner-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              value={ownerEmail}
              aria-invalid={problem?.field === 'ownerEmail'}
              onChange={(event) => setOwnerEmail(event.target.value)}
            />
          </div>
        </fieldset>
        {problem !== null && (
          <div role="alert" className="text-destructive space-y-2 text-sm">
            <p>{problem.message}</p>
            {suggestedSlug !== null && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSlug(suggestedSlug);
                  setSuggestedSlug(null);
                  setProblem(null);
                }}
              >
                Usar «{suggestedSlug}»
              </Button>
            )}
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />} Convertir
          </Button>
        </div>
      </form>
    </DemoDialog>
  );
}

export function ConversionResult({
  result,
  onDismiss,
}: {
  readonly result: ConvertDemoResponse;
  readonly onDismiss: () => void;
}): ReactElement {
  const invitation = describeInvitation(result.invitation);
  const discarded = result.discardedDemoIds.length;
  return (
    <section
      aria-labelledby="demo-converted-heading"
      className="ui-card space-y-3 border-2 border-emerald-500 p-4 sm:p-5"
    >
      <h2 id="demo-converted-heading" className="ui-heading text-lg">
        Ya es cliente
      </h2>
      {result.tenant.primaryDomain !== null && (
        <p className="text-sm">
          Su sitio público queda en{' '}
          <span className="font-mono break-all">{result.tenant.primaryDomain}</span>.
        </p>
      )}
      <p
        role="status"
        className={
          invitation.tone === 'warning'
            ? 'text-sm font-medium text-amber-800 dark:text-amber-300'
            : 'text-sm'
        }
      >
        {invitation.text}
      </p>
      {discarded > 0 && (
        <p className="text-muted-foreground text-sm">
          {discarded === 1
            ? 'Se descartó 1 propuesta más de este prospecto.'
            : `Se descartaron ${String(discarded)} propuestas más de este prospecto.`}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        {result.tenant.id !== null && (
          <Button asChild>
            <Link href={`/clientes/${result.tenant.id}`}>Abrir en Clientes</Link>
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onDismiss}>
          Cerrar
        </Button>
      </div>
    </section>
  );
}
