import type { Prospect } from '../domain/DemoApi';
import type { CreateTenantMode } from './tenantForm';

// Mismo patrón que la API (`CreateDemoSchema`): se valida aquí para no gastar una petición en
// una dirección que igual va a volver rechazada.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 90;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PROSPECT_TEXT_FIELDS = [
  'businessName',
  'contactName',
  'phone',
  'email',
  'industry',
  'source',
  'notes',
] as const;

export type ProspectTextField = (typeof PROSPECT_TEXT_FIELDS)[number];

export type ProspectFormValues = Record<ProspectTextField, string>;

export const EMPTY_PROSPECT_FORM: ProspectFormValues = {
  businessName: '',
  contactName: '',
  phone: '',
  email: '',
  industry: '',
  source: '',
  notes: '',
};

export interface CreateDemoFormValues {
  readonly prospect: ProspectFormValues;
  readonly slug: string;
  readonly mode: CreateTenantMode;
  readonly templateId: string | null;
  readonly duplicateFromTenantId: string | null;
}

// Una segunda propuesta al mismo negocio reusa su ficha: solo se manda el id.
export interface ExistingProspect {
  readonly id: string;
  readonly businessName: string;
}

export interface FormProblem {
  readonly field: string | null;
  readonly message: string;
}

export const validateProspectForm = (values: ProspectFormValues): FormProblem | null => {
  if (values.businessName.trim().length < 2) {
    return { field: 'businessName', message: 'Escribe el nombre del negocio.' };
  }
  const email = values.email.trim();
  if (email !== '' && !EMAIL_PATTERN.test(email)) {
    return { field: 'email', message: 'Revisa el correo: no parece válido.' };
  }
  return null;
};

export const validateCreateDemoForm = (
  values: CreateDemoFormValues,
  existingProspect: ExistingProspect | null,
): FormProblem | null => {
  if (existingProspect === null) {
    const prospectProblem = validateProspectForm(values.prospect);
    if (prospectProblem !== null) {
      return prospectProblem;
    }
  }
  const slug = values.slug.trim();
  if (slug.length < 2 || slug.length > SLUG_MAX_LENGTH || !SLUG_PATTERN.test(slug)) {
    return {
      field: 'slug',
      message:
        'La dirección usa solo minúsculas, números y guiones, por ejemplo "pasteleria-luna".',
    };
  }
  if (values.mode === 'template' && values.templateId === null) {
    return { field: 'templateId', message: 'Elige un kit por rubro.' };
  }
  if (values.mode === 'duplicate' && values.duplicateFromTenantId === null) {
    return {
      field: 'duplicateFromTenantId',
      message: 'Elige qué sitio quieres duplicar.',
    };
  }
  return null;
};

// Vacío va como nulo: la API guarda "sin teléfono" de una sola forma.
const optionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

export const buildCreateDemoPayload = (
  values: CreateDemoFormValues,
  existingProspect: ExistingProspect | null,
): Record<string, unknown> => {
  const businessName =
    existingProspect?.businessName ?? values.prospect.businessName.trim();
  const origin =
    values.mode === 'template' && values.templateId !== null
      ? { templateId: values.templateId }
      : values.mode === 'duplicate' && values.duplicateFromTenantId !== null
        ? { duplicateFromTenantId: values.duplicateFromTenantId }
        : {};
  const prospect =
    existingProspect === null
      ? {
          prospect: {
            businessName,
            contactName: optionalText(values.prospect.contactName),
            phone: optionalText(values.prospect.phone),
            email: optionalText(values.prospect.email),
            industry: optionalText(values.prospect.industry),
            source: optionalText(values.prospect.source),
            notes: optionalText(values.prospect.notes),
          },
        }
      : { prospectId: existingProspect.id };
  return { slug: values.slug.trim(), name: businessName, ...origin, ...prospect };
};

export const prospectFormFrom = (prospect: Prospect): ProspectFormValues => ({
  businessName: prospect.businessName,
  contactName: prospect.contactName ?? '',
  phone: prospect.phone ?? '',
  email: prospect.email ?? '',
  industry: prospect.industry ?? '',
  source: prospect.source ?? '',
  notes: prospect.notes ?? '',
});

// Solo lo que cambió: si dos personas editan la ficha a la vez, cada una pisa únicamente el
// campo que tocó (las notas de la llamada no se pierden por corregir un teléfono).
export const buildProspectPatch = (
  original: Prospect,
  values: ProspectFormValues,
): Partial<Record<ProspectTextField, string | null>> => {
  const before = prospectFormFrom(original);
  const patch: Partial<Record<ProspectTextField, string | null>> = {};
  for (const field of PROSPECT_TEXT_FIELDS) {
    if (values[field].trim() !== before[field].trim()) {
      patch[field] =
        field === 'businessName' ? values[field].trim() : optionalText(values[field]);
    }
  }
  return patch;
};

export interface ConvertDemoFormValues {
  readonly slug: string;
  readonly ownerName: string;
  readonly ownerEmail: string;
}

export const validateConvertForm = (
  values: ConvertDemoFormValues,
): FormProblem | null => {
  const slug = values.slug.trim();
  if (slug !== '' && (!SLUG_PATTERN.test(slug) || slug.startsWith('demo-'))) {
    return {
      field: 'slug',
      message:
        'La dirección definitiva usa minúsculas, números y guiones, y no empieza con "demo-".',
    };
  }
  const name = values.ownerName.trim();
  const email = values.ownerEmail.trim();
  if ((name === '') !== (email === '')) {
    return {
      field: name === '' ? 'ownerName' : 'ownerEmail',
      message: 'Para crear la cuenta del dueño hacen falta su nombre y su correo.',
    };
  }
  if (name !== '' && name.length < 2) {
    return { field: 'ownerName', message: 'El nombre del dueño es muy corto.' };
  }
  if (email !== '' && !EMAIL_PATTERN.test(email)) {
    return {
      field: 'ownerEmail',
      message: 'Revisa el correo del dueño: no parece válido.',
    };
  }
  return null;
};

export const buildConvertPayload = (
  values: ConvertDemoFormValues,
): { slug?: string; owner?: { name: string; email: string } } => {
  const slug = values.slug.trim();
  const name = values.ownerName.trim();
  const email = values.ownerEmail.trim();
  return {
    ...(slug === '' ? {} : { slug }),
    ...(name === '' || email === '' ? {} : { owner: { name, email } }),
  };
};
