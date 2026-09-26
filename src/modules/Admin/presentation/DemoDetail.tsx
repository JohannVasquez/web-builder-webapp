'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactElement } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Ban,
  CalendarPlus,
  Handshake,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Undo2,
} from 'lucide-react';
import type { AdminRole } from '@/modules/Auth/domain/Session';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import {
  DemoDetailSchema,
  DemoLinkResponseSchema,
  DemoResponseSchema,
  DemoVisitsSchema,
  ProspectResponseSchema,
  type ConvertDemoResponse,
  type CreateDemoResponse,
  type Demo,
  type DemoDiscardReason,
  type DemoLink,
  type Prospect,
} from '../domain/DemoApi';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  availableDemoActions,
  demoBusinessName,
  describeDevice,
  describeExpiry,
  describeVisitPage,
  describeVisits,
  discardReasonLabel,
  displayStatusOf,
  formatDemoDate,
  formatDemoDateTime,
  type DemoActions,
} from '../application/demoPresentation';
import {
  buildProspectPatch,
  prospectFormFrom,
  validateProspectForm,
  type FormProblem,
  type ProspectFormValues,
} from '../application/demoForm';
import {
  demoDetailCacheKey,
  demoVisitsCacheKey,
  refreshDemoData,
} from '../application/demoCache';
import { refreshTenantLists } from '../application/tenantCache';
import { useAdminApi } from './useAdminApi';
import { CreateDemoForm } from './CreateDemoForm';
import { ConversionResult, ConvertDemoDialog, DiscardDemoDialog } from './DemoOutcome';
import { DemoLinksReveal } from './DemoLinksReveal';
import { DemoStatusBadge } from './DemoStatusBadge';
import { ProspectFields } from './ProspectFields';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { Button } from '@/shared/ui/button';

const VISITS_PER_PAGE = 20;

export interface DemoDetailProps {
  readonly demoId: string;
  readonly platformDomain: string;
}

type RevealedLink = { readonly link: DemoLink } | null;

export function DemoDetail({ demoId, platformDomain }: DemoDetailProps): ReactElement {
  const api = useAdminApi();
  const router = useRouter();
  const { session } = useSession();
  const role: AdminRole = session?.user.role ?? 'client';

  const detail = useAsyncData(demoDetailCacheKey(demoId), () =>
    api.get(`/api/admin/demos/${demoId}`, DemoDetailSchema),
  );

  const [revealed, setRevealed] = useState<RevealedLink>(null);
  const [converted, setConverted] = useState<ConvertDemoResponse | null>(null);
  const [dialog, setDialog] = useState<'discard' | 'convert' | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
  const [proposal, setProposal] = useState<CreateDemoResponse | null>(null);

  if (detail.data === null) {
    return detail.error !== null ? (
      <div className="space-y-3">
        <BackToDemos />
        <p role="alert" className="text-destructive">
          {detail.error}
        </p>
      </div>
    ) : (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando demo...
      </p>
    );
  }

  const { demo, prospect, otherDemos } = detail.data;
  const actions = availableDemoActions(demo, role);
  const businessName = demoBusinessName(demo);
  const base = `/api/admin/demos/${demoId}`;

  // Toda acción muestra el resultado o el error de la API con sus palabras.
  const run = async (
    name: string,
    action: () => Promise<void>,
    successMessage: string,
    fallback: string,
  ): Promise<boolean> => {
    setPendingAction(name);
    try {
      await action();
      refreshDemoData();
      toast.success(successMessage);
      return true;
    } catch (cause) {
      toast.error(describeAdminError(cause, fallback).message);
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  const regenerate = (kind: 'prospect' | 'team'): void => {
    const warning =
      kind === 'prospect'
        ? 'El enlace que ya le mandaste al prospecto dejará de funcionar y tendrás que enviarle el nuevo. ¿Generar uno nuevo?'
        : 'El enlace de equipo actual dejará de funcionar. ¿Generar uno nuevo?';
    if (!window.confirm(warning)) {
      return;
    }
    void run(
      `link-${kind}`,
      async () => {
        const { link } = await api.post(
          `${base}/${kind === 'prospect' ? 'prospect-link' : 'team-link'}`,
          undefined,
          DemoLinkResponseSchema,
        );
        setRevealed({ link });
      },
      'Enlace nuevo generado. El anterior ya no funciona.',
      'No pudimos generar el enlace. Inténtalo nuevamente.',
    );
  };

  const extend = (): void => {
    void run(
      'extend',
      async () => {
        await api.post(`${base}/extend`, undefined, DemoResponseSchema);
      },
      'Demo extendida 14 días.',
      'No pudimos extender la demo. Inténtalo nuevamente.',
    );
  };

  const toggleExpiry = (): void => {
    const neverExpires = !demo.neverExpires;
    void run(
      'expiry',
      async () => {
        await api.patch(`${base}/expiry`, { neverExpires }, DemoResponseSchema);
      },
      neverExpires
        ? 'La demo ya no vence.'
        : 'La demo vuelve a tener vencimiento en 14 días.',
      'No pudimos cambiar el vencimiento. Inténtalo nuevamente.',
    );
  };

  const discard = async (reason: DemoDiscardReason | null): Promise<void> => {
    const done = await run(
      'discard',
      async () => {
        await api.post(
          `${base}/discard`,
          reason === null ? {} : { reason },
          DemoResponseSchema,
        );
      },
      'Demo descartada. El prospecto ya no puede abrirla.',
      'No pudimos descartar la demo. Inténtalo nuevamente.',
    );
    if (done) {
      setDialog(null);
    }
  };

  const restore = (): void => {
    void run(
      'restore',
      async () => {
        await api.post(`${base}/restore`, undefined, DemoResponseSchema);
      },
      'Demo recuperada: vigente por 14 días con el mismo enlace.',
      'No pudimos recuperar la demo. Inténtalo nuevamente.',
    );
  };

  const remove = (): void => {
    if (
      !window.confirm(
        `Vas a borrar la demo de "${businessName}": su sitio, sus imágenes y los datos del prospecto. No se puede deshacer. ¿Borrar?`,
      )
    ) {
      return;
    }
    void (async () => {
      const done = await run(
        'delete',
        async () => {
          await api.remove(base, { confirm: true });
        },
        'Demo borrada.',
        'No pudimos borrar la demo. Inténtalo nuevamente.',
      );
      if (done) {
        refreshTenantLists();
        router.push('/demos');
      }
    })();
  };

  const openOtherDemos = otherDemos.filter(
    (other) => other.status === 'vigente' || other.status === 'vencida',
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <BackToDemos />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="ui-heading text-2xl break-words">{businessName}</h1>
            {demo.site?.address != null && (
              <p className="text-muted-foreground font-mono text-sm break-all">
                {demo.site.address}
              </p>
            )}
          </div>
          <DemoStatusBadge status={displayStatusOf(demo)} />
        </div>
        <p className="text-muted-foreground text-sm">
          {describeExpiry(demo)}
          {demo.extensionCount > 0 &&
            ` · extendida ${String(demo.extensionCount)} ${demo.extensionCount === 1 ? 'vez' : 'veces'}`}
          {' · '}Creada por {demo.createdBy.name} el {formatDemoDate(demo.createdAt)}
          {demo.discardReason !== null &&
            ` · Motivo del descarte: ${discardReasonLabel(demo.discardReason)}`}
        </p>
      </div>

      {revealed !== null && (
        <DemoLinksReveal
          title={
            revealed.link.kind === 'prospect'
              ? 'Nuevo enlace del prospecto'
              : 'Nuevo enlace de equipo'
          }
          prospectLink={revealed.link.kind === 'prospect' ? revealed.link : null}
          teamLink={revealed.link.kind === 'team' ? revealed.link : null}
          businessName={businessName}
          contactName={prospect?.contactName ?? null}
          phone={prospect?.phone ?? null}
          onDismiss={() => setRevealed(null)}
        />
      )}

      {converted !== null && (
        <ConversionResult result={converted} onDismiss={() => setConverted(null)} />
      )}

      <DemoActionsPanel
        demo={demo}
        actions={actions}
        pendingAction={pendingAction}
        onRegenerate={regenerate}
        onExtend={extend}
        onToggleExpiry={toggleExpiry}
        onDiscard={() => setDialog('discard')}
        onRestore={restore}
        onConvert={() => setDialog('convert')}
        onDelete={remove}
      />

      <section
        aria-labelledby="demo-prospect-heading"
        className="ui-card space-y-4 p-4 sm:p-6"
      >
        <h2 id="demo-prospect-heading" className="ui-heading text-lg">
          Prospecto
        </h2>
        {prospect === null ? (
          <p className="text-muted-foreground text-sm">Esta demo ya no tiene ficha.</p>
        ) : (
          <ProspectEditor key={prospect.updatedAt} demoId={demoId} prospect={prospect} />
        )}
      </section>

      <section
        aria-labelledby="demo-others-heading"
        className="ui-card space-y-4 p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="demo-others-heading" className="ui-heading text-lg">
            Otras propuestas
          </h2>
          {prospect !== null && !isProposalFormOpen && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsProposalFormOpen(true)}
            >
              <Plus className="size-4" /> Nueva propuesta
            </Button>
          )}
        </div>
        {proposal !== null && (
          <DemoLinksReveal
            title={`Propuesta nueva: ${proposal.demo.site?.address ?? businessName}`}
            prospectLink={proposal.links.prospect}
            teamLink={proposal.links.team}
            businessName={proposal.prospect.businessName}
            contactName={proposal.prospect.contactName}
            phone={proposal.prospect.phone}
            onDismiss={() => setProposal(null)}
          />
        )}
        {isProposalFormOpen && prospect !== null && (
          <CreateDemoForm
            platformDomain={platformDomain}
            existingProspect={{ id: prospect.id, businessName: prospect.businessName }}
            onCancel={() => setIsProposalFormOpen(false)}
            onCreated={(created) => {
              setIsProposalFormOpen(false);
              setProposal(created);
            }}
          />
        )}
        <OtherProposals demos={otherDemos} />
      </section>

      <section
        aria-labelledby="demo-visits-heading"
        className="ui-card space-y-4 p-4 sm:p-6"
      >
        <h2 id="demo-visits-heading" className="ui-heading text-lg">
          Visitas del prospecto
        </h2>
        <p className="text-muted-foreground text-sm">
          {describeVisits(demo.visits)}
          {demo.visits.lastAt !== null &&
            ` · última el ${formatDemoDateTime(demo.visits.lastAt)}`}
          . Solo cuenta el enlace del prospecto; el de equipo no deja visitas.
        </p>
        {demo.visits.count > 0 && <DemoVisitsList demoId={demoId} />}
      </section>

      {dialog === 'discard' && (
        <DiscardDemoDialog
          isPending={pendingAction === 'discard'}
          onClose={() => setDialog(null)}
          onDiscard={(reason) => void discard(reason)}
        />
      )}

      {dialog === 'convert' && (
        <ConvertDemoDialog
          demo={demo}
          openSiblingCount={openOtherDemos.length}
          onClose={() => setDialog(null)}
          onConverted={(result) => {
            setDialog(null);
            setConverted(result);
            refreshDemoData();
            refreshTenantLists();
          }}
        />
      )}
    </div>
  );
}

function BackToDemos(): ReactElement {
  return (
    <Link
      href="/demos"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
    >
      <ArrowLeft className="size-4" /> Demos
    </Link>
  );
}

export interface DemoActionsPanelProps {
  readonly demo: Pick<Demo, 'neverExpires' | 'site' | 'status'>;
  readonly actions: DemoActions;
  readonly pendingAction: string | null;
  readonly onRegenerate: (kind: 'prospect' | 'team') => void;
  readonly onExtend: () => void;
  readonly onToggleExpiry: () => void;
  readonly onDiscard: () => void;
  readonly onRestore: () => void;
  readonly onConvert: () => void;
  readonly onDelete: () => void;
}

// Solo aparece lo que el rol y el estado permiten: un editor no ve Borrar y una convertida no
// ofrece extender. Sin hooks, para probar la visibilidad sin montar la ficha.
export function DemoActionsPanel({
  demo,
  actions,
  pendingAction,
  onRegenerate,
  onExtend,
  onToggleExpiry,
  onDiscard,
  onRestore,
  onConvert,
  onDelete,
}: DemoActionsPanelProps): ReactElement {
  const isBusy = pendingAction !== null;
  const spinnerOr = (name: string, icon: ReactElement): ReactElement =>
    pendingAction === name ? <Loader2 className="size-4 animate-spin" /> : icon;

  return (
    <section
      aria-labelledby="demo-actions-heading"
      className="ui-card space-y-4 p-4 sm:p-6"
    >
      <h2 id="demo-actions-heading" className="ui-heading text-lg">
        Acciones
      </h2>

      <div className="grid gap-2 sm:flex sm:flex-wrap">
        {actions.canEditSite && demo.site != null && (
          <Button asChild variant="outline">
            <Link href={`/clientes/${demo.site.tenantId}`}>
              <Pencil className="size-4" />
              {demo.status === 'convertida' ? 'Abrir cliente' : 'Editar sitio'}
            </Link>
          </Button>
        )}
        {actions.canConvert && (
          <Button type="button" disabled={isBusy} onClick={onConvert}>
            <Handshake className="size-4" /> Convertir en cliente
          </Button>
        )}
        {actions.canExtend && (
          <Button type="button" variant="outline" disabled={isBusy} onClick={onExtend}>
            {spinnerOr('extend', <CalendarPlus className="size-4" />)} Extender 14 días
          </Button>
        )}
        {actions.canRestore && (
          <Button type="button" variant="outline" disabled={isBusy} onClick={onRestore}>
            {spinnerOr('restore', <Undo2 className="size-4" />)} Recuperar
          </Button>
        )}
      </div>

      {actions.canToggleExpiry && (
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <div>
            <p id="demo-never-expires-label" className="font-medium">
              Sin vencimiento
            </p>
            <p className="text-muted-foreground text-sm">
              Para una demo de portafolio: queda vigente y nunca se borra sola.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={demo.neverExpires}
            aria-labelledby="demo-never-expires-label"
            disabled={isBusy}
            onClick={onToggleExpiry}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
              demo.neverExpires ? 'bg-primary' : 'bg-input'
            }`}
          >
            <span
              aria-hidden="true"
              className={`bg-background inline-block size-6 rounded-full shadow transition-transform ${
                demo.neverExpires ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {actions.canRegenerateLinks && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-muted-foreground text-sm">
            ¿Perdiste un enlace? Genera uno nuevo: el anterior deja de funcionar.
          </p>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => onRegenerate('prospect')}
            >
              {spinnerOr('link-prospect', <Link2 className="size-4" />)} Regenerar enlace
              del prospecto
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => onRegenerate('team')}
            >
              {spinnerOr('link-team', <Link2 className="size-4" />)} Regenerar enlace de
              equipo
            </Button>
          </div>
        </div>
      )}

      {(actions.canDiscard || actions.canDelete) && (
        <div className="grid gap-2 border-t pt-4 sm:flex sm:flex-wrap">
          {actions.canDiscard && (
            <Button type="button" variant="outline" disabled={isBusy} onClick={onDiscard}>
              <Ban className="size-4" /> Descartar
            </Button>
          )}
          {actions.canDelete && (
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy}
              onClick={onDelete}
            >
              {spinnerOr('delete', <Trash2 className="size-4" />)} Borrar
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

function ProspectEditor({
  demoId,
  prospect,
}: {
  readonly demoId: string;
  readonly prospect: Prospect;
}): ReactElement {
  const api = useAdminApi();
  const [values, setValues] = useState<ProspectFormValues>(() =>
    prospectFormFrom(prospect),
  );
  const [problem, setProblem] = useState<FormProblem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const invalid = validateProspectForm(values);
    setProblem(invalid);
    if (invalid !== null) {
      return;
    }
    const patch = buildProspectPatch(prospect, values);
    if (Object.keys(patch).length === 0) {
      toast('No hay cambios que guardar.');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch(
        `/api/admin/demos/${demoId}/prospect`,
        patch,
        ProspectResponseSchema,
      );
      refreshDemoData();
      toast.success('Ficha del prospecto guardada.');
    } catch (cause) {
      setProblem({
        field: null,
        message: describeAdminError(
          cause,
          'No pudimos guardar la ficha. Inténtalo nuevamente.',
        ).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4" noValidate>
      <ProspectFields
        idPrefix="demo-prospect"
        values={values}
        invalidField={problem?.field ?? null}
        onChange={setValues}
      />
      {problem !== null && (
        <p role="alert" className="text-destructive text-sm">
          {problem.message}
        </p>
      )}
      <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
        {isSaving && <Loader2 className="size-4 animate-spin" />} Guardar ficha
      </Button>
    </form>
  );
}

function OtherProposals({ demos }: { readonly demos: readonly Demo[] }): ReactElement {
  if (demos.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Es la única propuesta para este negocio.
      </p>
    );
  }
  return (
    <ul className="divide-y">
      {demos.map((other) => (
        <li
          key={other.id}
          className="flex flex-wrap items-center justify-between gap-2 py-3"
        >
          <div className="min-w-0">
            <Link href={`/demos/${other.id}`} className="font-medium hover:underline">
              {other.site?.address ?? other.site?.name ?? 'Propuesta sin sitio'}
            </Link>
            <p className="text-muted-foreground text-sm">
              {describeExpiry(other)} · {describeVisits(other.visits)}
            </p>
          </div>
          <DemoStatusBadge status={displayStatusOf(other)} />
        </li>
      ))}
    </ul>
  );
}

function DemoVisitsList({ demoId }: { readonly demoId: string }): ReactElement {
  const api = useAdminApi();
  const [page, setPage] = useState(1);
  const visits = useAsyncData(demoVisitsCacheKey(demoId, page), () =>
    api.get(
      `/api/admin/demos/${demoId}/visits?page=${String(page)}&perPage=${String(VISITS_PER_PAGE)}`,
      DemoVisitsSchema,
    ),
  );

  if (visits.data === null) {
    return visits.error !== null ? (
      <p role="alert" className="text-destructive text-sm">
        {visits.error}
      </p>
    ) : (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Cargando visitas...
      </p>
    );
  }

  const pageCount = Math.max(1, Math.ceil(visits.data.total / VISITS_PER_PAGE));

  return (
    <div className="space-y-3">
      <ol className="divide-y">
        {visits.data.visits.map((visit) => {
          const device = describeDevice(visit.userAgent);
          return (
            <li
              key={visit.id}
              className="flex flex-wrap justify-between gap-x-4 py-2 text-sm"
            >
              <span className="font-medium">{describeVisitPage(visit.pageSlug)}</span>
              <span className="text-muted-foreground">
                {formatDemoDateTime(visit.visitedAt)}
                {device !== null && ` · ${device}`}
              </span>
            </li>
          );
        })}
      </ol>
      {pageCount > 1 && (
        <nav
          aria-label="Páginas de visitas"
          className="flex items-center justify-between gap-2"
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Más recientes
          </Button>
          <span className="text-muted-foreground text-sm">
            Página {page} de {pageCount}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Anteriores
          </Button>
        </nav>
      )}
    </div>
  );
}
