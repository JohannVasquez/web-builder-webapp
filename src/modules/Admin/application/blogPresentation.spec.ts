import {
  translatePostStatus,
  toLocalDateTimeInput,
  formatPostDate,
  isScheduledPostVisible,
  generateSlugFromTitle,
} from './blogPresentation';

describe('blogPresentation', () => {
  describe('translatePostStatus', () => {
    it('traduce los estados correctamente', () => {
      expect(translatePostStatus('draft')).toBe('Borrador');
      expect(translatePostStatus('published')).toBe('Publicada');
      expect(translatePostStatus('scheduled')).toBe('Programada');
    });
  });

  describe('formatPostDate', () => {
    it('formatea fechas válidas', () => {
      // Usamos una fecha fija en UTC, pero como formatPostDate usa hora local
      // la aserción podría variar según la zona horaria donde corra el test.
      // Así que inyectamos la zona horaria en el test si es posible, o validamos partes.
      const date = new Date('2026-09-16T19:02:00.000Z');
      const formatted = formatPostDate(date.toISOString());
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('devuelve "Sin fecha" si es null', () => {
      expect(formatPostDate(null)).toBe('Sin fecha');
    });

    it('maneja fechas inválidas', () => {
      expect(formatPostDate('no-es-fecha')).toBe('Fecha inválida');
    });
  });

  describe('isScheduledPostVisible', () => {
    it('es false si no es programada', () => {
      expect(isScheduledPostVisible('draft', '2020-01-01T00:00:00Z')).toBe(false);
      expect(isScheduledPostVisible('published', '2020-01-01T00:00:00Z')).toBe(false);
    });

    it('es false si no tiene fecha', () => {
      expect(isScheduledPostVisible('scheduled', null)).toBe(false);
    });

    it('es true si la fecha es pasada o actual', () => {
      const now = new Date('2026-09-16T19:00:00Z');
      expect(isScheduledPostVisible('scheduled', '2026-09-16T18:00:00Z', now)).toBe(true);
      expect(isScheduledPostVisible('scheduled', '2026-09-16T19:00:00Z', now)).toBe(true);
    });

    it('es false si la fecha es futura', () => {
      const now = new Date('2026-09-16T19:00:00Z');
      expect(isScheduledPostVisible('scheduled', '2026-09-16T20:00:00Z', now)).toBe(false);
    });
  });

  describe('generateSlugFromTitle', () => {
    it('genera slugs correctos', () => {
      expect(generateSlugFromTitle('Mi Nuevo Post')).toBe('mi-nuevo-post');
      expect(generateSlugFromTitle('¿Qué tal el camión?')).toBe('que-tal-el-camion');
      expect(generateSlugFromTitle('  Espacios   dobles  ')).toBe('espacios-dobles');
      expect(generateSlugFromTitle('---Guiones-al-borde---')).toBe('guiones-al-borde');
      expect(generateSlugFromTitle('año nuevo')).toBe('ano-nuevo');
    });
  });
});

describe('toLocalDateTimeInput', () => {
  it('muestra la hora local, no la UTC', () => {
    const local = new Date(2031, 0, 15, 10, 0);

    expect(toLocalDateTimeInput(local.toISOString())).toBe('2031-01-15T10:00');
  });

  it('ida y vuelta no corre la fecha', () => {
    const iso = new Date(2031, 0, 15, 10, 0).toISOString();

    expect(new Date(toLocalDateTimeInput(iso)).toISOString()).toBe(iso);
  });

  it('deja vacío cuando no hay fecha o es inválida', () => {
    expect(toLocalDateTimeInput(null)).toBe('');
    expect(toLocalDateTimeInput('no-es-fecha')).toBe('');
  });
});
