import { z } from 'zod';

// Demo de prospecto (épica DEMO de la API): el sitio privado de un negocio real que todavía no
// compró. No confundir con los "sitios de demostración" públicos de web-builder-api#104.
// Contrato en `web-builder-api/docs/demos.md`.

// Estado derivado por la API con la hora de cada consulta. `borrada` solo llega en la
// respuesta de borrar: una demo borrada no se lista ni se consulta.
export const DEMO_STATUSES = [
  'vigente',
  'vencida',
  'convertida',
  'descartada',
  'borrada',
] as const;
export const DemoStatusSchema = z.enum(DEMO_STATUSES);

// Lo único que se puede elegir al descartar: lista cerrada, pensada para las métricas.
export const DEMO_DISCARD_REASONS = [
  'no-interesado',
  'precio',
  'ya-tiene-sitio',
  'no-responde',
  'otro',
] as const;
export const DemoDiscardReasonSchema = z.enum(DEMO_DISCARD_REASONS);

// `otra-propuesta` lo pone la conversión en las otras demos del mismo prospecto; no se elige.
export const StoredDiscardReasonSchema = z.enum([
  ...DEMO_DISCARD_REASONS,
  'otra-propuesta',
]);

export const DemoCreatorSchema = z.object({
  type: z.enum(['admin', 'apiKey']),
  id: z.string().nullable(),
  name: z.string(),
});

export const DemoSiteSchema = z.object({
  tenantId: z.string(),
  slug: z.string(),
  name: z.string(),
  // La única dirección de la demo (`demo-<slug>.<plataforma>`), o la definitiva al convertir.
  address: z.string().nullable(),
});

// Lo justo para llamar al prospecto desde la lista sin abrir la ficha.
export const DemoProspectSummarySchema = z.object({
  id: z.string(),
  businessName: z.string(),
  contactName: z.string().nullable(),
  phone: z.string().nullable(),
  hasEmail: z.boolean(),
});

export const DemoSchema = z.object({
  id: z.string(),
  status: DemoStatusSchema,
  tenantId: z.string().nullable(),
  prospectId: z.string().nullable(),
  templateId: z.string().nullable(),
  industry: z.string().nullable(),
  createdBy: DemoCreatorSchema,
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  neverExpires: z.boolean(),
  extensionCount: z.number(),
  outcome: z.enum(['converted', 'discarded']).nullable(),
  outcomeAt: z.string().nullable(),
  discardReason: StoredDiscardReasonSchema.nullable(),
  purgedAt: z.string().nullable(),
  visits: z.object({
    count: z.number(),
    firstAt: z.string().nullable(),
    lastAt: z.string().nullable(),
  }),
  expiryWarning: z
    .object({
      sentAt: z.string().nullable(),
      expiresAt: z.string().nullable(),
      error: z.string().nullable(),
    })
    .optional(),
  // Ausentes en la fila anónima que devuelve el borrado.
  site: DemoSiteSchema.nullable().optional(),
  prospect: DemoProspectSummarySchema.nullable().optional(),
});

export const ProspectSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  contactName: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  industry: z.string().nullable(),
  source: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Un enlace en claro: la API lo entrega una sola vez, al crear o al regenerar.
export const DemoLinkSchema = z.object({
  kind: z.enum(['prospect', 'team']),
  url: z.string(),
  token: z.string(),
});

export const CreateDemoResponseSchema = z.object({
  demo: DemoSchema,
  prospect: ProspectSchema,
  links: z.object({ prospect: DemoLinkSchema, team: DemoLinkSchema }),
});

export const DemosSchema = z.object({ demos: z.array(DemoSchema) });

export const DemoDetailSchema = z.object({
  demo: DemoSchema,
  prospect: ProspectSchema.nullable(),
  otherDemos: z.array(DemoSchema),
});

export const DemoResponseSchema = z.object({ demo: DemoSchema });

export const ProspectResponseSchema = z.object({ prospect: ProspectSchema });

export const DemoLinkResponseSchema = z.object({ link: DemoLinkSchema });

export const DemoVisitSchema = z.object({
  id: z.string(),
  pageSlug: z.string(),
  visitedAt: z.string(),
  userAgent: z.string().nullable(),
});

export const DemoVisitsSchema = z.object({
  visits: z.array(DemoVisitSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export const DemoInvitationSchema = z.object({
  status: z.enum(['sent', 'not-needed', 'failed']),
  message: z.string().optional(),
});

export const ConvertDemoResponseSchema = z.object({
  demo: DemoSchema,
  tenant: z.object({
    id: z.string().nullable(),
    slug: z.string().nullable(),
    status: z.string(),
    primaryDomain: z.string().nullable(),
  }),
  removedAddresses: z.array(z.string()),
  discardedDemoIds: z.array(z.string()),
  owner: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      created: z.boolean(),
    })
    .nullable(),
  invitation: DemoInvitationSchema.nullable(),
});

export const DeleteDemoResponseSchema = z.object({
  demo: DemoSchema,
  files: z.object({ deleted: z.number(), pending: z.number() }),
  prospectDeleted: z.boolean(),
});

export type DemoStatus = z.infer<typeof DemoStatusSchema>;
export type DemoDiscardReason = z.infer<typeof DemoDiscardReasonSchema>;
export type StoredDiscardReason = z.infer<typeof StoredDiscardReasonSchema>;
export type Demo = z.infer<typeof DemoSchema>;
export type Prospect = z.infer<typeof ProspectSchema>;
export type DemoLink = z.infer<typeof DemoLinkSchema>;
export type CreateDemoResponse = z.infer<typeof CreateDemoResponseSchema>;
export type DemoDetail = z.infer<typeof DemoDetailSchema>;
export type DemoVisit = z.infer<typeof DemoVisitSchema>;
export type DemoInvitation = z.infer<typeof DemoInvitationSchema>;
export type ConvertDemoResponse = z.infer<typeof ConvertDemoResponseSchema>;
