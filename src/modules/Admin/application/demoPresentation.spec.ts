import {
  availableDemoActions,
  buildDemoListPath,
  defaultClientSlug,
  defaultProspectMessage,
  demoAddressPreview,
  describeDevice,
  describeExpiry,
  describeInvitation,
  describeVisitPage,
  discardReasonLabel,
  displayStatusOf,
  filterDemosByBusiness,
  whatsappUrl,
} from './demoPresentation';
import type { Demo } from '../domain/DemoApi';

const NOW = new Date('2026-09-26T12:00:00.000Z');
const inDays = (days: number): string =>
  new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

const site = {
  tenantId: '018f6f1a-0000-7000-8000-000000000010',
  slug: 'demo-pasteleria-luna',
  name: 'Pastelería Luna',
  address: 'demo-pasteleria-luna.webbuilder.cl',
};

const prospect = {
  id: '018f6f1a-0000-7000-8000-000000000020',
  businessName: 'Pastelería Luna',
  contactName: 'Luna',
  phone: '+56 9 1234 5678',
  hasEmail: false,
};

const makeDemo = (overrides: Partial<Demo> = {}): Demo => ({
  id: '018f6f1a-0000-7000-8000-000000000001',
  status: 'vigente',
  tenantId: site.tenantId,
  prospectId: '018f6f1a-0000-7000-8000-000000000020',
  templateId: 'pasteleria',
  industry: 'Pastelería',
  createdBy: { type: 'admin', id: 'u1', name: 'Ana' },
  createdAt: inDays(-3),
  expiresAt: inDays(11),
  neverExpires: false,
  extensionCount: 0,
  outcome: null,
  outcomeAt: null,
  discardReason: null,
  purgedAt: null,
  visits: { count: 0, firstAt: null, lastAt: null },
  site,
  prospect,
  ...overrides,
});

describe('displayStatusOf', () => {
  it('una vigente que vence dentro de 3 días se muestra por vencer', () => {
    expect(displayStatusOf(makeDemo({ expiresAt: inDays(2) }), NOW)).toBe('por-vencer');
    expect(displayStatusOf(makeDemo({ expiresAt: inDays(3) }), NOW)).toBe('por-vencer');
  });

  it('una vigente con más plazo o sin vencimiento sigue vigente', () => {
    expect(displayStatusOf(makeDemo({ expiresAt: inDays(4) }), NOW)).toBe('vigente');
    expect(displayStatusOf(makeDemo({ expiresAt: null, neverExpires: true }), NOW)).toBe(
      'vigente',
    );
  });

  it('los demás estados pasan tal cual', () => {
    expect(
      displayStatusOf(makeDemo({ status: 'vencida', expiresAt: inDays(-1) }), NOW),
    ).toBe('vencida');
    expect(
      displayStatusOf(makeDemo({ status: 'descartada', expiresAt: inDays(1) }), NOW),
    ).toBe('descartada');
  });
});

describe('buildDemoListPath', () => {
  it('sin filtros pide la lista completa', () => {
    expect(buildDemoListPath({ status: 'todas', onlyMine: false }, 'u1')).toBe(
      '/api/admin/demos',
    );
  });

  it('manda el estado (incluido por vencer) y quién las creó', () => {
    expect(buildDemoListPath({ status: 'por-vencer', onlyMine: true }, 'u1')).toBe(
      '/api/admin/demos?status=por-vencer&createdBy=u1',
    );
  });
});

describe('filterDemosByBusiness', () => {
  const luna = makeDemo();
  const taller = makeDemo({
    id: 'd2',
    prospect: { ...prospect, businessName: 'Taller Andes' },
  });

  it('busca por negocio sin importar tildes ni mayúsculas', () => {
    expect(filterDemosByBusiness([luna, taller], 'PASTELERIA')).toEqual([luna]);
  });

  it('sin texto devuelve todas', () => {
    expect(filterDemosByBusiness([luna, taller], '  ')).toHaveLength(2);
  });
});

describe('whatsappUrl', () => {
  it('deja solo los dígitos del teléfono y codifica el mensaje', () => {
    expect(whatsappUrl('+56 9 1234-5678', 'Hola, mira: https://x.cl/demo/a')).toBe(
      'https://wa.me/56912345678?text=Hola%2C%20mira%3A%20https%3A%2F%2Fx.cl%2Fdemo%2Fa',
    );
  });

  it('sin teléfono abre WhatsApp para elegir el contacto', () => {
    expect(whatsappUrl(null, 'Hola')).toBe('https://wa.me/?text=Hola');
  });
});

describe('defaultProspectMessage', () => {
  it('saluda por el nombre e incluye el negocio y el enlace', () => {
    const message = defaultProspectMessage({
      contactName: 'Luna',
      businessName: 'Pastelería Luna',
      url: 'https://demo-luna.webbuilder.cl/demo/abc',
    });
    expect(message).toContain('¡Hola, Luna!');
    expect(message).toContain('Pastelería Luna');
    expect(message).toContain('https://demo-luna.webbuilder.cl/demo/abc');
  });

  it('sin contacto saluda sin nombre', () => {
    expect(
      defaultProspectMessage({ contactName: null, businessName: 'X', url: 'u' }),
    ).toMatch(/^¡Hola! /);
  });
});

describe('demoAddressPreview', () => {
  it('arma demo-<slug>.<dominio>', () => {
    expect(demoAddressPreview('pasteleria-luna', 'webbuilder.cl')).toBe(
      'demo-pasteleria-luna.webbuilder.cl',
    );
  });

  it('sin slug ni dominio muestra una dirección genérica', () => {
    expect(demoAddressPreview('', '')).toBe('demo-tu-negocio.dominio-de-la-plataforma');
  });
});

describe('defaultClientSlug', () => {
  it('quita el prefijo demo- y el sufijo de una segunda propuesta', () => {
    expect(defaultClientSlug('demo-pasteleria-luna')).toBe('pasteleria-luna');
    expect(defaultClientSlug('demo-pasteleria-luna-2')).toBe('pasteleria-luna');
  });

  it('igual que la API, solo quita sufijos de -2 a -50', () => {
    // Un nombre real que termina en número dentro de ese rango se pierde: por eso el diálogo
    // deja escribir el slug definitivo.
    expect(defaultClientSlug('demo-taller-24')).toBe('taller');
    expect(defaultClientSlug('demo-taller-51')).toBe('taller-51');
    expect(defaultClientSlug('demo-local-1')).toBe('local-1');
  });
});

describe('availableDemoActions', () => {
  it('un editor puede todo menos borrar', () => {
    const actions = availableDemoActions(makeDemo(), 'editor');
    expect(actions).toMatchObject({
      canExtend: true,
      canToggleExpiry: true,
      canDiscard: true,
      canConvert: true,
      canRegenerateLinks: true,
      canEditSite: true,
      canRestore: false,
      canDelete: false,
    });
  });

  it('la dueña además puede borrar', () => {
    expect(availableDemoActions(makeDemo(), 'owner').canDelete).toBe(true);
  });

  it('un usuario cliente no puede hacer nada', () => {
    expect(Object.values(availableDemoActions(makeDemo(), 'client'))).not.toContain(true);
  });

  it('sin vencimiento no se extiende, pero se puede volver a poner vencimiento', () => {
    const actions = availableDemoActions(
      makeDemo({ neverExpires: true, expiresAt: null }),
      'editor',
    );
    expect(actions.canExtend).toBe(false);
    expect(actions.canToggleExpiry).toBe(true);
  });

  it('una descartada solo se recupera (y la dueña la puede borrar)', () => {
    const actions = availableDemoActions(makeDemo({ status: 'descartada' }), 'owner');
    expect(actions).toMatchObject({
      canRestore: true,
      canExtend: false,
      canToggleExpiry: false,
      canDiscard: false,
      canConvert: false,
      canDelete: true,
    });
  });

  it('una convertida no se extiende, no regenera enlaces ni se borra', () => {
    const actions = availableDemoActions(makeDemo({ status: 'convertida' }), 'owner');
    expect(actions).toMatchObject({
      canRegenerateLinks: false,
      canExtend: false,
      canToggleExpiry: false,
      canDiscard: false,
      canConvert: false,
      canRestore: false,
      canDelete: false,
      canEditSite: true,
    });
  });
});

describe('describeInvitation', () => {
  it('explica cada resultado de la invitación al dueño', () => {
    expect(describeInvitation({ status: 'sent' }).tone).toBe('success');
    expect(
      describeInvitation({ status: 'not-needed', message: 'Ya tenía cuenta.' }).text,
    ).toBe('Ya tenía cuenta.');
    const failed = describeInvitation({ status: 'failed', message: 'SMTP caído.' });
    expect(failed.tone).toBe('warning');
    expect(failed.text).toContain('SMTP caído.');
    expect(failed.text).toContain('Olvidé mi contraseña');
    expect(describeInvitation(null).tone).toBe('info');
  });
});

describe('textos de la ficha', () => {
  it('describe el vencimiento según el estado', () => {
    expect(describeExpiry(makeDemo({ neverExpires: true, expiresAt: null }))).toBe(
      'Sin vencimiento',
    );
    expect(describeExpiry(makeDemo({ status: 'convertida' }))).toBe(
      'Es cliente: no vence',
    );
    expect(describeExpiry(makeDemo({ status: 'vencida' }))).toMatch(/^Venció el /);
    expect(describeExpiry(makeDemo())).toMatch(/^Vence el /);
  });

  it('nombra el motivo del descarte, también el que pone la conversión', () => {
    expect(discardReasonLabel('precio')).toBe('Por el precio');
    expect(discardReasonLabel('otra-propuesta')).toBe('Compró otra propuesta');
  });

  it('la portada se llama Inicio y el dispositivo se resume', () => {
    expect(describeVisitPage('home')).toBe('Inicio');
    expect(describeVisitPage('contacto')).toBe('/contacto');
    expect(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile')).toBe(
      'Celular',
    );
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(
      'Computador',
    );
    expect(describeDevice(null)).toBeNull();
  });
});
