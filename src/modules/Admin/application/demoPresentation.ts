import type { AdminRole } from '@/modules/Auth/domain/Session';
import type {
  Demo,
  DemoDiscardReason,
  DemoInvitation,
  DemoStatus,
  StoredDiscardReason,
} from '../domain/DemoApi';

// Mismo valor por defecto que `DEMO_EXPIRY_WARNING_DAYS` en la API: la ventana en la que una
// demo vigente pasa a la lista "por vencer".
export const DEMO_EXPIRY_WARNING_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

// "Por vencer" no es un estado de la API sino una vigente dentro de la ventana de aviso; en la
// lista se muestra aparte porque es la que pide llamar al prospecto.
export type DemoDisplayStatus = DemoStatus | 'por-vencer';

export const DEMO_STATUS_LABELS: Record<DemoDisplayStatus, string> = {
  vigente: 'Vigente',
  'por-vencer': 'Por vencer',
  vencida: 'Vencida',
  convertida: 'Convertida',
  descartada: 'Descartada',
  borrada: 'Borrada',
};

export const displayStatusOf = (
  demo: Pick<Demo, 'status' | 'expiresAt'>,
  now: Date = new Date(),
): DemoDisplayStatus => {
  if (demo.status !== 'vigente' || demo.expiresAt === null) {
    return demo.status;
  }
  const remaining = new Date(demo.expiresAt).getTime() - now.getTime();
  return remaining <= DEMO_EXPIRY_WARNING_DAYS * DAY_MS ? 'por-vencer' : 'vigente';
};

export type DemoStatusFilter = 'todas' | Exclude<DemoDisplayStatus, 'borrada'>;

export const DEMO_STATUS_FILTERS: readonly { value: DemoStatusFilter; label: string }[] =
  [
    { value: 'todas', label: 'Todas' },
    { value: 'vigente', label: 'Vigentes' },
    { value: 'por-vencer', label: 'Por vencer' },
    { value: 'vencida', label: 'Vencidas' },
    { value: 'convertida', label: 'Convertidas' },
    { value: 'descartada', label: 'Descartadas' },
  ];

export interface DemoListFilters {
  readonly status: DemoStatusFilter;
  readonly onlyMine: boolean;
}

// El estado y "creadas por mí" los filtra la API (así "por vencer" usa su misma ventana); la
// búsqueda por negocio se hace aquí, sobre la lista ya cargada.
export const buildDemoListPath = (filters: DemoListFilters, userId: string): string => {
  const params = new URLSearchParams();
  if (filters.status !== 'todas') {
    params.set('status', filters.status);
  }
  if (filters.onlyMine) {
    params.set('createdBy', userId);
  }
  const query = params.toString();
  return query === '' ? '/api/admin/demos' : `/api/admin/demos?${query}`;
};

export const demoBusinessName = (demo: Pick<Demo, 'prospect' | 'site'>): string =>
  demo.prospect?.businessName ?? demo.site?.name ?? 'Demo sin nombre';

export const filterDemosByBusiness = <T extends Pick<Demo, 'prospect' | 'site'>>(
  demos: readonly T[],
  query: string,
): readonly T[] => {
  const term = normalize(query.trim());
  if (term === '') {
    return demos;
  }
  return demos.filter((demo) => normalize(demoBusinessName(demo)).includes(term));
};

// Sin tildes ni mayúsculas: quien busca "pasteleria" en el celular tiene que encontrar
// "Pastelería".
const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// `wa.me` solo acepta dígitos: sin `+`, espacios ni guiones. Sin teléfono se abre WhatsApp
// para elegir el contacto a mano.
export const whatsappUrl = (phone: string | null, message: string): string => {
  const digits = (phone ?? '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

export const whatsappChatUrl = (phone: string): string =>
  `https://wa.me/${phone.replace(/\D/g, '')}`;

export const hasPhoneDigits = (phone: string | null): phone is string =>
  phone !== null && /\d/.test(phone);

export const defaultProspectMessage = (input: {
  readonly contactName: string | null;
  readonly businessName: string;
  readonly url: string;
}): string => {
  const greeting =
    input.contactName !== null && input.contactName.trim() !== ''
      ? `¡Hola, ${input.contactName.trim()}!`
      : '¡Hola!';
  return `${greeting} Te preparé una propuesta de sitio web para ${input.businessName}. Puedes verla aquí: ${input.url}\nCuéntame qué te parece; cualquier cambio lo ajustamos.`;
};

// Vista previa de la dirección antes de crear. La definitiva la devuelve la API.
export const demoAddressPreview = (slug: string, platformDomain: string): string => {
  const cleanSlug = slug.trim() === '' ? 'tu-negocio' : slug.trim();
  const domain =
    platformDomain.trim() === '' ? 'dominio-de-la-plataforma' : platformDomain.trim();
  return `demo-${cleanSlug}.${domain}`;
};

// El slug definitivo que la API usará si no se manda otro: sin `demo-` y sin el `-2`…`-50`
// que puso la sugerencia al crear una segunda propuesta.
export const defaultClientSlug = (demoSlug: string): string => {
  const withoutPrefix = demoSlug.startsWith('demo-') ? demoSlug.slice(5) : demoSlug;
  const match = /^(.{2,})-(\d+)$/.exec(withoutPrefix);
  const number = Number(match?.[2]);
  return match?.[1] !== undefined && number >= 2 && number <= 50
    ? match[1]
    : withoutPrefix;
};

export const DISCARD_REASON_OPTIONS: readonly {
  value: DemoDiscardReason;
  label: string;
}[] = [
  { value: 'no-interesado', label: 'No le interesa' },
  { value: 'precio', label: 'Por el precio' },
  { value: 'ya-tiene-sitio', label: 'Ya tiene sitio' },
  { value: 'no-responde', label: 'No responde' },
  { value: 'otro', label: 'Otro motivo' },
];

export const discardReasonLabel = (reason: StoredDiscardReason): string =>
  reason === 'otra-propuesta'
    ? 'Compró otra propuesta'
    : (DISCARD_REASON_OPTIONS.find((option) => option.value === reason)?.label ?? reason);

export interface DemoActions {
  readonly canRegenerateLinks: boolean;
  readonly canExtend: boolean;
  readonly canToggleExpiry: boolean;
  readonly canDiscard: boolean;
  readonly canRestore: boolean;
  readonly canConvert: boolean;
  readonly canDelete: boolean;
  readonly canEditSite: boolean;
}

const NO_ACTIONS: DemoActions = {
  canRegenerateLinks: false,
  canExtend: false,
  canToggleExpiry: false,
  canDiscard: false,
  canRestore: false,
  canConvert: false,
  canDelete: false,
  canEditSite: false,
};

// Las mismas reglas que la API (docs/demos.md), para no ofrecer un botón que solo va a
// devolver un 422 o un 403. Un `client` no ve nada: las demos son de la agencia.
export const availableDemoActions = (
  demo: Pick<Demo, 'status' | 'neverExpires' | 'site'>,
  role: AdminRole,
): DemoActions => {
  if (role === 'client' || demo.status === 'borrada') {
    return NO_ACTIONS;
  }
  const isOpen = demo.status === 'vigente' || demo.status === 'vencida';
  const hasSite = demo.site !== null && demo.site !== undefined;
  return {
    canRegenerateLinks: hasSite && demo.status !== 'convertida',
    canExtend: isOpen && !demo.neverExpires,
    canToggleExpiry: isOpen,
    canDiscard: isOpen,
    canRestore: demo.status === 'descartada',
    canConvert: isOpen,
    // Borrar es solo de la dueña: los vendedores descartan y la tarea diaria borra.
    canDelete: role === 'owner' && demo.status !== 'convertida',
    canEditSite: hasSite,
  };
};

export interface InvitationPresentation {
  readonly tone: 'success' | 'info' | 'warning';
  readonly text: string;
}

export const describeInvitation = (
  invitation: DemoInvitation | null,
): InvitationPresentation => {
  if (invitation === null) {
    return {
      tone: 'info',
      text: 'No se creó una cuenta para el dueño. Puedes invitarlo después desde Usuarios.',
    };
  }
  if (invitation.status === 'sent') {
    return {
      tone: 'success',
      text: 'Le enviamos al dueño un correo para que elija su contraseña.',
    };
  }
  if (invitation.status === 'not-needed') {
    return {
      tone: 'info',
      text:
        invitation.message ??
        'El dueño ya tenía cuenta: entra con su contraseña de siempre y ya ve este sitio.',
    };
  }
  return {
    tone: 'warning',
    text: `${invitation.message ?? 'No pudimos enviar el correo de invitación.'} La conversión quedó hecha: el dueño puede entrar con "Olvidé mi contraseña".`,
  };
};

export const formatDemoDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatDemoDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });

export const describeExpiry = (
  demo: Pick<Demo, 'status' | 'expiresAt' | 'neverExpires'>,
): string => {
  if (demo.status === 'convertida') {
    return 'Es cliente: no vence';
  }
  if (demo.neverExpires || demo.expiresAt === null) {
    return 'Sin vencimiento';
  }
  return demo.status === 'vencida'
    ? `Venció el ${formatDemoDate(demo.expiresAt)}`
    : `Vence el ${formatDemoDate(demo.expiresAt)}`;
};

export const describeVisits = (visits: Demo['visits']): string => {
  if (visits.count === 0) {
    return 'Sin visitas';
  }
  return visits.count === 1 ? '1 visita' : `${String(visits.count)} visitas`;
};

// La portada se guarda con el slug `home`, pero el vendedor la conoce como "Inicio".
export const describeVisitPage = (pageSlug: string): string =>
  pageSlug === 'home' || pageSlug === '' ? 'Inicio' : `/${pageSlug}`;

// Pista gruesa, suficiente para la llamada ("la abriste desde el celular"): el agente de
// usuario completo no le dice nada a un vendedor.
export const describeDevice = (userAgent: string | null): string | null => {
  if (userAgent === null) {
    return null;
  }
  if (/iPad|Tablet/i.test(userAgent)) {
    return 'Tableta';
  }
  return /Mobi|Android|iPhone/i.test(userAgent) ? 'Celular' : 'Computador';
};
