import {
  acceptAll,
  allows,
  CONSENT_TEXT_VERSION,
  decisionFor,
  needsDecision,
  rejectAll,
} from './Consent';

describe('decisiones', () => {
  it('aceptar todo incluye las opcionales', () => {
    const decision = acceptAll();

    expect(allows(decision, 'analytics')).toBe(true);
    expect(allows(decision, 'advertising')).toBe(true);
  });

  it('rechazar todo conserva las necesarias: sin ellas el sitio no funciona', () => {
    const decision = rejectAll();

    expect(allows(decision, 'necessary')).toBe(true);
    expect(allows(decision, 'analytics')).toBe(false);
    expect(allows(decision, 'advertising')).toBe(false);
  });

  it('aceptar medición no autoriza publicidad', () => {
    const decision = decisionFor(['analytics']);

    expect(allows(decision, 'analytics')).toBe(true);
    // Perfilar además implica enviar datos fuera de Chile.
    expect(allows(decision, 'advertising')).toBe(false);
  });

  it('una elección parcial siempre incluye las necesarias, aunque no se marquen', () => {
    expect(decisionFor([]).purposes).toEqual(['necessary']);
  });
});

describe('ausencia de decisión', () => {
  it('sin decisión no hay permiso: el silencio no es un sí', () => {
    expect(allows(null, 'analytics')).toBe(false);
    expect(allows(null, 'advertising')).toBe(false);
  });

  it('las necesarias funcionan igual sin decisión', () => {
    expect(allows(null, 'necessary')).toBe(true);
  });

  it('hay que preguntar mientras no exista decisión', () => {
    expect(needsDecision(null)).toBe(true);
    expect(needsDecision(acceptAll())).toBe(false);
  });
});

describe('versión del texto', () => {
  const viejo = {
    purposes: ['necessary', 'analytics'] as const,
    textVersion: 'cookies-2020',
  };

  it('una decisión sobre un texto viejo no cubre el texto nuevo', () => {
    expect(allows({ ...viejo, purposes: [...viejo.purposes] }, 'analytics')).toBe(false);
  });

  it('y obliga a volver a preguntar', () => {
    expect(needsDecision({ ...viejo, purposes: [...viejo.purposes] })).toBe(true);
  });

  it('las decisiones nuevas se sellan con la versión vigente', () => {
    expect(acceptAll().textVersion).toBe(CONSENT_TEXT_VERSION);
    expect(rejectAll().textVersion).toBe(CONSENT_TEXT_VERSION);
  });
});
