import {
  EMPTY_PROSPECT_FORM,
  buildConvertPayload,
  buildCreateDemoPayload,
  buildProspectPatch,
  validateConvertForm,
  validateCreateDemoForm,
  type CreateDemoFormValues,
} from './demoForm';
import type { Prospect } from '../domain/DemoApi';

const values = (overrides: Partial<CreateDemoFormValues> = {}): CreateDemoFormValues => ({
  prospect: {
    ...EMPTY_PROSPECT_FORM,
    businessName: 'Pastelería Luna',
    phone: '+56 9 1234 5678',
    notes: '  4,8 estrellas  ',
  },
  slug: 'pasteleria-luna',
  mode: 'template',
  templateId: 'pasteleria',
  duplicateFromTenantId: null,
  ...overrides,
});

describe('validateCreateDemoForm', () => {
  it('acepta un formulario completo', () => {
    expect(validateCreateDemoForm(values(), null)).toBeNull();
  });

  it('exige el nombre del negocio', () => {
    const problem = validateCreateDemoForm(
      values({ prospect: { ...EMPTY_PROSPECT_FORM, businessName: ' ' } }),
      null,
    );
    expect(problem?.field).toBe('businessName');
  });

  it('no pide el negocio en una segunda propuesta para una ficha existente', () => {
    const problem = validateCreateDemoForm(values({ prospect: EMPTY_PROSPECT_FORM }), {
      id: 'p1',
      businessName: 'Pastelería Luna',
    });
    expect(problem).toBeNull();
  });

  it('rechaza un correo mal escrito', () => {
    const problem = validateCreateDemoForm(
      values({
        prospect: { ...EMPTY_PROSPECT_FORM, businessName: 'Luna', email: 'luna@' },
      }),
      null,
    );
    expect(problem?.field).toBe('email');
  });

  it.each(['', 'Pastelería Luna', 'pasteleria_luna', '-luna', 'a'])(
    'rechaza la dirección "%s"',
    (slug) => {
      expect(validateCreateDemoForm(values({ slug }), null)?.field).toBe('slug');
    },
  );

  it('pide elegir el kit o el sitio a duplicar según el punto de partida', () => {
    expect(validateCreateDemoForm(values({ templateId: null }), null)?.field).toBe(
      'templateId',
    );
    expect(
      validateCreateDemoForm(
        values({ mode: 'duplicate', duplicateFromTenantId: null }),
        null,
      )?.field,
    ).toBe('duplicateFromTenantId');
    expect(
      validateCreateDemoForm(values({ mode: 'empty', templateId: null }), null),
    ).toBeNull();
  });
});

describe('buildCreateDemoPayload', () => {
  it('manda el prospecto nuevo con los vacíos como nulos y el kit elegido', () => {
    expect(buildCreateDemoPayload(values(), null)).toEqual({
      slug: 'pasteleria-luna',
      name: 'Pastelería Luna',
      templateId: 'pasteleria',
      prospect: {
        businessName: 'Pastelería Luna',
        contactName: null,
        phone: '+56 9 1234 5678',
        email: null,
        industry: null,
        source: null,
        notes: '4,8 estrellas',
      },
    });
  });

  it('al duplicar manda el sitio de origen y no el kit', () => {
    const payload = buildCreateDemoPayload(
      values({ mode: 'duplicate', duplicateFromTenantId: 't9' }),
      null,
    );
    expect(payload).toMatchObject({ duplicateFromTenantId: 't9' });
    expect(payload).not.toHaveProperty('templateId');
  });

  it('una demo vacía no manda origen', () => {
    const payload = buildCreateDemoPayload(values({ mode: 'empty' }), null);
    expect(payload).not.toHaveProperty('templateId');
    expect(payload).not.toHaveProperty('duplicateFromTenantId');
  });

  it('una segunda propuesta manda el id del prospecto y no sus datos', () => {
    const payload = buildCreateDemoPayload(values({ slug: 'luna-moderna' }), {
      id: 'p1',
      businessName: 'Pastelería Luna',
    });
    expect(payload).toEqual({
      slug: 'luna-moderna',
      name: 'Pastelería Luna',
      templateId: 'pasteleria',
      prospectId: 'p1',
    });
  });
});

describe('buildProspectPatch', () => {
  const prospect: Prospect = {
    id: 'p1',
    businessName: 'Pastelería Luna',
    contactName: 'Luna',
    phone: '+56 9 1234 5678',
    email: null,
    industry: 'Pastelería',
    source: null,
    notes: 'Llamar el lunes',
    createdAt: '2026-09-20T12:00:00.000Z',
    updatedAt: '2026-09-20T12:00:00.000Z',
  };

  const form = {
    businessName: 'Pastelería Luna',
    contactName: 'Luna',
    phone: '+56 9 1234 5678',
    email: '',
    industry: 'Pastelería',
    source: '',
    notes: 'Llamar el lunes',
  };

  it('sin cambios no manda nada', () => {
    expect(buildProspectPatch(prospect, form)).toEqual({});
  });

  it('manda solo lo que cambió, y un campo borrado como nulo', () => {
    expect(
      buildProspectPatch(prospect, {
        ...form,
        notes: 'Le gustó; vuelve a llamar el martes',
        contactName: '',
      }),
    ).toEqual({ notes: 'Le gustó; vuelve a llamar el martes', contactName: null });
  });
});

describe('validateConvertForm y buildConvertPayload', () => {
  it('todo vacío es válido y manda un cuerpo vacío', () => {
    const empty = { slug: '', ownerName: '', ownerEmail: '' };
    expect(validateConvertForm(empty)).toBeNull();
    expect(buildConvertPayload(empty)).toEqual({});
  });

  it('manda el slug y el dueño cuando vienen completos', () => {
    const filled = {
      slug: ' pasteleria-luna ',
      ownerName: 'Ana Pérez',
      ownerEmail: 'ana@pasteleria.cl',
    };
    expect(validateConvertForm(filled)).toBeNull();
    expect(buildConvertPayload(filled)).toEqual({
      slug: 'pasteleria-luna',
      owner: { name: 'Ana Pérez', email: 'ana@pasteleria.cl' },
    });
  });

  it('el slug definitivo no lleva el prefijo demo-', () => {
    expect(
      validateConvertForm({ slug: 'demo-luna', ownerName: '', ownerEmail: '' })?.field,
    ).toBe('slug');
  });

  it('el dueño necesita nombre y correo, y un correo válido', () => {
    expect(
      validateConvertForm({ slug: '', ownerName: 'Ana', ownerEmail: '' })?.field,
    ).toBe('ownerEmail');
    expect(
      validateConvertForm({ slug: '', ownerName: '', ownerEmail: 'ana@x.cl' })?.field,
    ).toBe('ownerName');
    expect(
      validateConvertForm({ slug: '', ownerName: 'Ana', ownerEmail: 'ana' })?.field,
    ).toBe('ownerEmail');
  });
});
