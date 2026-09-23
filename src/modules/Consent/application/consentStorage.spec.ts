import { clearCookiesFor, readDecision, writeDecision } from './consentStorage';
import { CONSENT_TEXT_VERSION } from '../domain/Consent';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string): string | null => storage.get(key) ?? null,
      setItem: (key: string, value: string): void => void storage.set(key, value),
    },
  });
});

describe('readDecision', () => {
  it('sin nada guardado no hay decisión', () => {
    expect(readDecision()).toBeNull();
  });

  it('lee lo que se guardó', () => {
    writeDecision({ purposes: ['necessary', 'analytics'], textVersion: 'cookies-v1' });

    expect(readDecision()).toEqual({
      purposes: ['necessary', 'analytics'],
      textVersion: 'cookies-v1',
    });
  });

  it('un valor corrupto se trata como ausencia: se vuelve a preguntar', () => {
    storage.set('web-builder.consent', 'no-es-json{');

    expect(readDecision()).toBeNull();
  });

  it('descarta finalidades que no existen en vez de confiar en lo guardado', () => {
    storage.set(
      'web-builder.consent',
      JSON.stringify({ purposes: ['analytics', 'lo-que-sea'], textVersion: 'v1' }),
    );

    expect(readDecision()?.purposes).toEqual(['analytics']);
  });

  it('sin la versión del texto la decisión no sirve, porque no se sabe qué se aceptó', () => {
    storage.set('web-builder.consent', JSON.stringify({ purposes: ['analytics'] }));

    expect(readDecision()).toBeNull();
  });
});

describe('writeDecision', () => {
  it('un almacenamiento que lanza no rompe la decisión de la visita', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (): string | null => null,
        setItem: (): never => {
          throw new Error('modo privado');
        },
      },
    });

    expect(() =>
      writeDecision({ purposes: ['necessary'], textVersion: CONSENT_TEXT_VERSION }),
    ).not.toThrow();
  });
});

describe('clearCookiesFor', () => {
  const buildDocument = (cookie: string): Document => {
    const written: string[] = [];
    return {
      get cookie(): string {
        return cookie;
      },
      set cookie(value: string) {
        written.push(value);
      },
      location: { hostname: 'tienda.acme.cl' },
      // Se expone para poder comprobar qué se intentó borrar.
      written,
    } as unknown as Document & { written: string[] };
  };

  it('borra las cookies de la finalidad rechazada', () => {
    const doc = buildDocument('_ga=abc; _fbp=xyz; carrito=1') as Document & {
      written: string[];
    };

    clearCookiesFor(['analytics'], doc);

    expect(doc.written.some((entry) => entry.startsWith('_ga='))).toBe(true);
    // No se toca lo que no es de esa finalidad.
    expect(doc.written.some((entry) => entry.startsWith('_fbp='))).toBe(false);
    expect(doc.written.some((entry) => entry.startsWith('carrito='))).toBe(false);
  });

  it('las expira en el pasado, que es la única forma de borrar una cookie', () => {
    const doc = buildDocument('_ga=abc') as Document & { written: string[] };

    clearCookiesFor(['analytics'], doc);

    expect(doc.written[0]).toContain('expires=Thu, 01 Jan 1970');
  });

  it('lo intenta también en el dominio padre, donde los rastreadores las ponen', () => {
    const doc = buildDocument('_ga=abc') as Document & { written: string[] };

    clearCookiesFor(['analytics'], doc);

    expect(doc.written.some((entry) => entry.includes('domain=.acme.cl'))).toBe(true);
  });

  it('sin finalidades rechazadas no toca nada', () => {
    const doc = buildDocument('_ga=abc') as Document & { written: string[] };

    clearCookiesFor([], doc);

    expect(doc.written).toHaveLength(0);
  });
});
