import { demoCookieOptions, isDemoHost, isDemoToken } from './demo';

const TOKEN = `demo_${'a1'.repeat(32)}`;

describe('isDemoToken', () => {
  it('acepta el prefijo demo_ seguido de 64 caracteres hex', () => {
    expect(isDemoToken(TOKEN)).toBe(true);
  });

  it.each([
    ['sin prefijo', 'a1'.repeat(32)],
    ['un token de revisión', 'f'.repeat(64)],
    ['corto', 'demo_abc'],
    ['con mayúsculas', `demo_${'A1'.repeat(32)}`],
    ['con basura al final', `${TOKEN}/`],
    ['vacío', ''],
  ])('rechaza %s', (_caso, value) => {
    expect(isDemoToken(value)).toBe(false);
  });

  it('rechaza la ausencia de valor', () => {
    expect(isDemoToken(undefined)).toBe(false);
    expect(isDemoToken(null)).toBe(false);
  });
});

describe('isDemoHost', () => {
  it('reconoce demo-<slug>.<plataforma> con el dominio de la plataforma configurado', () => {
    expect(isDemoHost('demo-pasteleria-luna.webbuilder.cl', 'webbuilder.cl')).toBe(true);
    expect(isDemoHost('demo-luna.localhost:3000', 'localhost')).toBe(true);
  });

  it('no confunde con una demo el dominio propio de un cliente que empieza por demo-', () => {
    expect(isDemoHost('demo-motors.cl', 'webbuilder.cl')).toBe(false);
    expect(isDemoHost('demo-luna.otra-plataforma.cl', 'webbuilder.cl')).toBe(false);
  });

  it('no toma por demo el subdominio normal de un cliente', () => {
    expect(isDemoHost('pasteleria-luna.webbuilder.cl', 'webbuilder.cl')).toBe(false);
    expect(isDemoHost('demo.webbuilder.cl', 'webbuilder.cl')).toBe(false);
    expect(isDemoHost('demo-.webbuilder.cl', 'webbuilder.cl')).toBe(false);
  });

  it('sin dominio de plataforma basta el prefijo del primer tramo', () => {
    expect(isDemoHost('demo-luna.webbuilder.cl', '')).toBe(true);
    expect(isDemoHost('luna.webbuilder.cl', '')).toBe(false);
  });

  it('no distingue mayúsculas', () => {
    expect(isDemoHost('DEMO-Luna.WebBuilder.cl', 'webbuilder.cl')).toBe(true);
  });
});

describe('demoCookieOptions', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.assign(process.env, { NODE_ENV: originalEnv });
  });

  it('es httpOnly, sameSite lax, en todo el sitio y sin dominio (queda atada al host)', () => {
    const options = demoCookieOptions();

    expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
    expect(options).not.toHaveProperty('domain');
  });

  it('es secure en producción', () => {
    Object.assign(process.env, { NODE_ENV: 'production' });

    expect(demoCookieOptions().secure).toBe(true);
  });

  it('no exige https fuera de producción', () => {
    Object.assign(process.env, { NODE_ENV: 'development' });

    expect(demoCookieOptions().secure).toBe(false);
  });
});
