import type { SiteTemplate } from '../domain/AdminApi';
import type { CreateDemoResponse, Demo, DemoDetail, Prospect } from '../domain/DemoApi';

// Solo para las pruebas de las pantallas de demos: la misma forma que responde la API
// (`web-builder-api/docs/demos.md`), para no repetir un objeto de treinta campos en cada spec.

export const DEMO_ID = '018f6f1a-0000-7000-8000-000000000001';
export const TENANT_ID = '018f6f1a-0000-7000-8000-000000000010';
export const PROSPECT_ID = '018f6f1a-0000-7000-8000-000000000020';

const DAY_MS = 24 * 60 * 60 * 1000;
export const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * DAY_MS).toISOString();

export const TEMPLATES: readonly SiteTemplate[] = [
  {
    id: 'pasteleria',
    label: 'Pastelería',
    industry: 'pastelería',
    description: 'Vitrina de tortas y pedidos.',
    pageCount: 4,
    visualStyle: 'classic',
  },
];

export const makeDemo = (overrides: Partial<Demo> = {}): Demo => ({
  id: DEMO_ID,
  status: 'vigente',
  tenantId: TENANT_ID,
  prospectId: PROSPECT_ID,
  templateId: 'pasteleria',
  industry: 'Pastelería',
  createdBy: { type: 'admin', id: 'u1', name: 'Ana' },
  createdAt: daysFromNow(-3),
  expiresAt: daysFromNow(11),
  neverExpires: false,
  extensionCount: 0,
  outcome: null,
  outcomeAt: null,
  discardReason: null,
  purgedAt: null,
  visits: { count: 0, firstAt: null, lastAt: null },
  expiryWarning: { sentAt: null, expiresAt: null, error: null },
  site: {
    tenantId: TENANT_ID,
    slug: 'demo-pasteleria-luna',
    name: 'Pastelería Luna',
    address: 'demo-pasteleria-luna.webbuilder.cl',
  },
  prospect: {
    id: PROSPECT_ID,
    businessName: 'Pastelería Luna',
    contactName: 'Luna',
    phone: '+56 9 1234 5678',
    hasEmail: false,
  },
  ...overrides,
});

export const PROSPECT: Prospect = {
  id: PROSPECT_ID,
  businessName: 'Pastelería Luna',
  contactName: 'Luna',
  phone: '+56 9 1234 5678',
  email: null,
  industry: 'Pastelería',
  source: 'Google Maps',
  notes: 'Llamar el lunes',
  createdAt: daysFromNow(-3),
  updatedAt: daysFromNow(-3),
};

export const PROSPECT_URL =
  'https://demo-pasteleria-luna.webbuilder.cl/demo/demo_' + 'a1'.repeat(32);
export const TEAM_URL =
  'https://demo-pasteleria-luna.webbuilder.cl/demo/demo_' + 'b2'.repeat(32);

export const CREATED_DEMO: CreateDemoResponse = {
  demo: makeDemo(),
  prospect: PROSPECT,
  links: {
    prospect: { kind: 'prospect', url: PROSPECT_URL, token: 'demo_' + 'a1'.repeat(32) },
    team: { kind: 'team', url: TEAM_URL, token: 'demo_' + 'b2'.repeat(32) },
  },
};

export const makeDetail = (overrides: Partial<DemoDetail> = {}): DemoDetail => ({
  demo: makeDemo(),
  prospect: PROSPECT,
  otherDemos: [],
  ...overrides,
});
