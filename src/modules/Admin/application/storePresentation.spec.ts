import {
  formatMoney,
  getAvailableNextStatuses,
  isValidSalePrice,
  proposeSlug,
  isValidCouponPercentage,
  startOfLocalDayIso,
  endOfLocalDayIso,
  toLocalDateInput,
  describeDelivery,
  formatPlace,
  formatReportDay,
} from './storePresentation';

describe('storePresentation', () => {
  describe('formatMoney', () => {
    it('formats CLP correctly', () => {
      expect(formatMoney(15000, 'CLP')).toContain('15.000');
    });

    it('formats 0 correctly', () => {
      expect(formatMoney(0, 'CLP')).toContain('0');
    });
  });

  describe('getAvailableNextStatuses', () => {
    it('returns available next statuses for pending', () => {
      expect(getAvailableNextStatuses('pending')).toEqual(['paid', 'cancelled']);
    });

    it('returns empty array for delivered', () => {
      expect(getAvailableNextStatuses('delivered')).toEqual([]);
    });

    it('returns empty array for cancelled', () => {
      expect(getAvailableNextStatuses('cancelled')).toEqual([]);
    });
  });

  describe('isValidSalePrice', () => {
    it('returns true when sale price is lower than regular price', () => {
      expect(isValidSalePrice(1000, 900)).toBe(true);
    });

    it('returns false when sale price is equal to regular price', () => {
      expect(isValidSalePrice(1000, 1000)).toBe(false);
    });

    it('returns false when sale price is higher than regular price', () => {
      expect(isValidSalePrice(1000, 1100)).toBe(false);
    });

    it('returns true when sale price is null', () => {
      expect(isValidSalePrice(1000, null)).toBe(true);
    });
  });

  describe('isValidCouponPercentage', () => {
    it('returns true when percentage is valid (<= 100)', () => {
      expect(isValidCouponPercentage('percentage', 50)).toBe(true);
      expect(isValidCouponPercentage('percentage', 100)).toBe(true);
    });

    it('returns false when percentage is invalid (> 100)', () => {
      expect(isValidCouponPercentage('percentage', 101)).toBe(false);
      expect(isValidCouponPercentage('percentage', 150)).toBe(false);
    });

    it('returns true when type is amount, regardless of value', () => {
      expect(isValidCouponPercentage('amount', 5000)).toBe(true);
      expect(isValidCouponPercentage('amount', 150)).toBe(true);
    });
  });

  describe('proposeSlug', () => {
    it('proposes a valid slug for a given name', () => {
      expect(proposeSlug('Zapatillas Nike Air Max 90')).toBe('zapatillas-nike-air-max-90');
    });

    it('removes diacritics and special characters', () => {
      expect(proposeSlug('¡Súper Oferta! (2024)')).toBe('super-oferta-2024');
    });

    it('handles multiple spaces', () => {
      expect(proposeSlug('Producto   con    espacios')).toBe('producto-con-espacios');
    });
  });
});

describe('rangos de días locales', () => {
  it('"desde" empieza a la medianoche local', () => {
    expect(startOfLocalDayIso('2026-09-30')).toBe(new Date(2026, 8, 30, 0, 0, 0, 0).toISOString());
  });

  it('"hasta" incluye el día entero', () => {
    const end = new Date(endOfLocalDayIso('2026-09-30') ?? '');

    expect(end.getDate()).toBe(30);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it('ida y vuelta no corre el día', () => {
    expect(toLocalDateInput(startOfLocalDayIso('2026-09-30'))).toBe('2026-09-30');
    expect(toLocalDateInput(endOfLocalDayIso('2026-09-30'))).toBe('2026-09-30');
  });

  it('ignora lo que no es una fecha', () => {
    expect(startOfLocalDayIso('')).toBeNull();
    expect(endOfLocalDayIso('30/09/2026')).toBeNull();
    expect(toLocalDateInput(null)).toBe('');
  });
});

describe('entrega del pedido', () => {
  it('dice cómo se entrega en español', () => {
    expect(describeDelivery({ method: 'pickup' })).toBe('Retiro en tienda');
    expect(describeDelivery({ method: 'shipping', shippingName: 'Despacho en Santiago' })).toBe(
      'Despacho: Despacho en Santiago',
    );
    expect(describeDelivery({ method: 'shipping', shippingName: null })).toBe('Despacho');
  });

  it('no deja una coma colgando si falta la región', () => {
    expect(formatPlace({ method: 'shipping', addressCity: 'Santiago', addressRegion: null })).toBe(
      'Santiago',
    );
    expect(formatPlace({ method: 'shipping', addressCity: 'Santiago', addressRegion: 'RM' })).toBe(
      'Santiago, RM',
    );
    expect(formatPlace({ method: 'pickup' })).toBe('');
  });
});

describe('formatReportDay', () => {
  it('muestra el día tal como viene, sin correrlo por la zona horaria', () => {
    expect(formatReportDay('2026-09-22')).toBe('22-09-2026');
  });

  it('deja intacto lo que no reconoce', () => {
    expect(formatReportDay('ayer')).toBe('ayer');
  });
});
