import {
  formatRange,
  groupConsecutiveDays,
  isOpenAt,
  type DayHours,
} from './openingHoursSchedule';

describe('isOpenAt', () => {
  it('abierto dentro del horario', () => {
    const days: DayHours[] = [{ day: 'lunes', open: '09:00', close: '20:00' }];
    // 2024-06-10T22:30:00Z == lunes 18:30 en America/Santiago (UTC-4).
    const now = new Date('2024-06-10T22:30:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(true);
  });

  it('cerrado antes de la apertura', () => {
    const days: DayHours[] = [{ day: 'lunes', open: '09:00', close: '20:00' }];
    // 2024-06-10T11:00:00Z == lunes 07:00 en America/Santiago.
    const now = new Date('2024-06-10T11:00:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(false);
  });

  it('cerrado después del cierre', () => {
    const days: DayHours[] = [{ day: 'lunes', open: '09:00', close: '20:00' }];
    // 2024-06-11T01:00:00Z == lunes 21:00 en America/Santiago.
    const now = new Date('2024-06-11T01:00:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(false);
  });

  it('un horario que cruza la medianoche funciona antes de las 00:00', () => {
    const days: DayHours[] = [{ day: 'viernes', open: '20:00', close: '02:00' }];
    // 2024-06-15T03:00:00Z == viernes 23:00 en America/Santiago.
    const now = new Date('2024-06-15T03:00:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(true);
  });

  it('un horario que cruza la medianoche funciona después de las 00:00', () => {
    const days: DayHours[] = [{ day: 'viernes', open: '20:00', close: '02:00' }];
    // 2024-06-15T05:00:00Z == sábado 01:00 en America/Santiago: sigue abierto por el turno del viernes.
    const now = new Date('2024-06-15T05:00:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(true);
  });

  it('un horario que cruza la medianoche cierra una vez pasada la hora de cierre', () => {
    const days: DayHours[] = [{ day: 'viernes', open: '20:00', close: '02:00' }];
    // 2024-06-15T07:00:00Z == sábado 03:00 en America/Santiago: ya cerró.
    const now = new Date('2024-06-15T07:00:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(false);
  });

  it('un día marcado closed nunca está abierto, aunque tenga horario', () => {
    const days: DayHours[] = [
      { day: 'lunes', open: '09:00', close: '20:00', closed: true },
    ];
    const now = new Date('2024-06-10T22:30:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(false);
  });

  it('un feriado que cae hoy gana sobre el horario normal', () => {
    const days: DayHours[] = [{ day: 'lunes', open: '09:00', close: '20:00' }];
    const now = new Date('2024-06-10T22:30:00Z');
    expect(isOpenAt(days, [{ date: '2024-06-10' }], now, 'America/Santiago')).toBe(false);
    // Un feriado en otra fecha no debería afectar.
    expect(isOpenAt(days, [{ date: '2024-12-25' }], now, 'America/Santiago')).toBe(true);
  });

  it('la zona horaria del negocio manda: el mismo instante da distinto resultado según la zona', () => {
    const days: DayHours[] = [{ day: 'lunes', open: '09:00', close: '20:00' }];
    // 2024-06-10T22:30:00Z: lunes 18:30 en Santiago (dentro de horario) vs. martes 00:30 en Madrid
    // (sin horario definido para martes).
    const now = new Date('2024-06-10T22:30:00Z');
    expect(isOpenAt(days, [], now, 'America/Santiago')).toBe(true);
    expect(isOpenAt(days, [], now, 'Europe/Madrid')).toBe(false);
  });
});

describe('groupConsecutiveDays', () => {
  it('agrupa lunes a viernes con el mismo horario', () => {
    const days: DayHours[] = [
      { day: 'lunes', open: '09:00', close: '18:00' },
      { day: 'martes', open: '09:00', close: '18:00' },
      { day: 'miercoles', open: '09:00', close: '18:00' },
      { day: 'jueves', open: '09:00', close: '18:00' },
      { day: 'viernes', open: '09:00', close: '18:00' },
      { day: 'sabado', open: '10:00', close: '14:00' },
    ];

    const groups = groupConsecutiveDays(days);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      open: '09:00',
      close: '18:00',
    });
    expect(groups[1]).toMatchObject({ days: ['sabado'], open: '10:00', close: '14:00' });
  });

  it('no agrupa días consecutivos si el horario difiere', () => {
    const days: DayHours[] = [
      { day: 'lunes', open: '09:00', close: '18:00' },
      { day: 'martes', open: '09:00', close: '18:00' },
      { day: 'miercoles', open: '09:00', close: '20:00' },
    ];

    const groups = groupConsecutiveDays(days);

    expect(groups).toHaveLength(2);
    expect(groups[0].days).toEqual(['lunes', 'martes']);
    expect(groups[1].days).toEqual(['miercoles']);
  });
});

describe('formatRange', () => {
  it('da "9:00–18:00"', () => {
    expect(formatRange('09:00', '18:00')).toBe('9:00–18:00');
  });
});
