'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { ArrowRight, Loader2, MessageCircle, Phone, Plus, Search } from 'lucide-react';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { DemosSchema, type CreateDemoResponse, type Demo } from '../domain/DemoApi';
import {
  DEMO_STATUS_FILTERS,
  buildDemoListPath,
  demoBusinessName,
  displayStatusOf,
  filterDemosByBusiness,
  formatDemoDate,
  formatDemoDateTime,
  hasPhoneDigits,
  whatsappChatUrl,
  type DemoListFilters,
} from '../application/demoPresentation';
import { demoListCacheKey } from '../application/demoCache';
import { useAdminApi } from './useAdminApi';
import { CreateDemoForm } from './CreateDemoForm';
import { DemoLinksReveal } from './DemoLinksReveal';
import { DemoStatusBadge } from './DemoStatusBadge';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export interface DemoManagerProps {
  // Dominio de la plataforma (`PLATFORM_DOMAIN`), solo para la vista previa de la dirección.
  readonly platformDomain: string;
}

export function DemoManager({ platformDomain }: DemoManagerProps): ReactElement {
  const api = useAdminApi();
  const { session } = useSession();
  const [filters, setFilters] = useState<DemoListFilters>({
    status: 'todas',
    onlyMine: false,
  });
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [created, setCreated] = useState<CreateDemoResponse | null>(null);
  // Fija por visita a la pantalla: "por vencer" no cambia mientras se mira la lista.
  const [now] = useState(() => new Date());

  const path = buildDemoListPath(filters, session?.user.id ?? '');
  const demos = useAsyncData(demoListCacheKey(path), async () => {
    const { demos: list } = await api.get(path, DemosSchema);
    return list;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="ui-heading text-2xl">Demos</h1>
        {!isFormOpen && (
          <Button type="button" onClick={() => setIsFormOpen(true)}>
            <Plus className="size-4" /> Nueva demo
          </Button>
        )}
      </div>

      {created !== null && (
        <div className="space-y-2">
          <DemoLinksReveal
            title={`Demo lista: ${created.prospect.businessName}`}
            prospectLink={created.links.prospect}
            teamLink={created.links.team}
            businessName={created.prospect.businessName}
            contactName={created.prospect.contactName}
            phone={created.prospect.phone}
            onDismiss={() => setCreated(null)}
          />
          <Link
            href={`/demos/${created.demo.id}`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            Abrir la ficha de la demo <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {isFormOpen && (
        <CreateDemoForm
          platformDomain={platformDomain}
          existingProspect={null}
          onCancel={() => setIsFormOpen(false)}
          onCreated={(response) => {
            setIsFormOpen(false);
            setCreated(response);
          }}
        />
      )}

      <DemoFilters
        filters={filters}
        query={query}
        onFiltersChange={setFilters}
        onQueryChange={setQuery}
      />

      {demos.error !== null ? (
        <p role="alert" className="text-destructive">
          {demos.error}
        </p>
      ) : demos.data === null ? (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando demos...
        </p>
      ) : (
        <DemoCards demos={filterDemosByBusiness(demos.data, query)} now={now} />
      )}
    </div>
  );
}

interface DemoFiltersProps {
  readonly filters: DemoListFilters;
  readonly query: string;
  readonly onFiltersChange: (filters: DemoListFilters) => void;
  readonly onQueryChange: (query: string) => void;
}

function DemoFilters({
  filters,
  query,
  onFiltersChange,
  onQueryChange,
}: DemoFiltersProps): ReactElement {
  return (
    <div className="space-y-3">
      {/* Se desliza de lado en el celular en vez de partirse en varias filas. */}
      <div
        role="group"
        aria-label="Filtrar por estado"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0"
      >
        {DEMO_STATUS_FILTERS.map((option) => {
          const isActive = filters.status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onFiltersChange({ ...filters, status: option.value })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            aria-label="Buscar por negocio"
            placeholder="Buscar negocio..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4"
            checked={filters.onlyMine}
            onChange={(event) =>
              onFiltersChange({ ...filters, onlyMine: event.target.checked })
            }
          />
          Creadas por mí
        </label>
      </div>
    </div>
  );
}

export interface DemoCardsProps {
  readonly demos: readonly Demo[];
  readonly now: Date;
}

// Sin hooks para poder probarla sin sesión ni API, igual que `TenantCards`. Tarjetas y no
// tabla: en el celular una tabla de siete columnas obliga a desplazarse de lado.
export function DemoCards({ demos, now }: DemoCardsProps): ReactElement {
  if (demos.length === 0) {
    return <p className="text-muted-foreground">No hay demos con estos filtros.</p>;
  }

  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {demos.map((demo) => {
        const status = displayStatusOf(demo, now);
        const businessName = demoBusinessName(demo);
        return (
          <li key={demo.id} className="ui-card space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/demos/${demo.id}`}
                  className="ui-heading block truncate text-lg hover:underline"
                >
                  {businessName}
                </Link>
                <p className="text-muted-foreground truncate text-sm">
                  {demo.industry ?? 'Sin rubro'}
                  {demo.site?.address != null && ` · ${demo.site.address}`}
                </p>
              </div>
              <DemoStatusBadge status={status} />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground text-xs">Vence el</dt>
                <dd>{expiryCell(demo)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Visitas</dt>
                <dd>{demo.visits.count}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Última visita</dt>
                <dd>
                  {demo.visits.lastAt === null
                    ? 'Nunca'
                    : formatDemoDateTime(demo.visits.lastAt)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground text-xs">Creada por</dt>
                <dd className="truncate">{demo.createdBy.name}</dd>
              </div>
            </dl>

            {status === 'por-vencer' && (
              <ExpiringContact demo={demo} businessName={businessName} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

const expiryCell = (demo: Demo): string => {
  if (demo.status === 'convertida') {
    return '—';
  }
  if (demo.neverExpires || demo.expiresAt === null) {
    return 'Sin vencimiento';
  }
  return formatDemoDate(demo.expiresAt);
};

// La lista "por vencer" es para llamar: el teléfono y WhatsApp quedan a un toque, sin abrir
// la ficha. Sin correo, al prospecto no le llega el aviso automático.
function ExpiringContact({
  demo,
  businessName,
}: {
  readonly demo: Demo;
  readonly businessName: string;
}): ReactElement {
  const phone = demo.prospect?.phone ?? null;
  return (
    <div className="bg-muted/50 space-y-2 rounded-md p-3 text-sm">
      {hasPhoneDigits(phone) ? (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex items-center gap-1.5 font-medium hover:underline"
          >
            <Phone className="size-4" aria-hidden="true" />
            {demo.prospect?.contactName != null && `${demo.prospect.contactName} · `}
            {phone}
          </a>
          <Button asChild size="sm" variant="outline">
            <a
              href={whatsappChatUrl(phone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir WhatsApp con ${businessName}`}
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </Button>
        </div>
      ) : (
        <p>Sin teléfono registrado.</p>
      )}
      {demo.prospect?.hasEmail === false && (
        <p className="text-muted-foreground">
          Sin correo: al prospecto no le llega el aviso de vencimiento.
        </p>
      )}
    </div>
  );
}
