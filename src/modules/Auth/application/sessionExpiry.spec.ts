import { INACTIVITY_TIMEOUT_MS, isInactivityExpired } from './sessionExpiry';

describe('isInactivityExpired', () => {
  it('vence cuando no hay marca de actividad', () => {
    expect(isInactivityExpired(null, Date.now())).toBe(true);
  });

  it('no vence justo antes de cumplirse el plazo', () => {
    const now = 1_000_000;
    const lastActivityAt = now - (INACTIVITY_TIMEOUT_MS - 1);
    expect(isInactivityExpired(lastActivityAt, now)).toBe(false);
  });

  it('vence apenas se cumple el plazo exacto', () => {
    const now = 1_000_000;
    const lastActivityAt = now - INACTIVITY_TIMEOUT_MS;
    expect(isInactivityExpired(lastActivityAt, now)).toBe(true);
  });

  it('vence bastante después del plazo', () => {
    const now = 1_000_000;
    const lastActivityAt = now - INACTIVITY_TIMEOUT_MS * 2;
    expect(isInactivityExpired(lastActivityAt, now)).toBe(true);
  });

  it('respeta un plazo distinto al de por defecto', () => {
    const now = 1_000_000;
    const lastActivityAt = now - 5_000;
    expect(isInactivityExpired(lastActivityAt, now, 10_000)).toBe(false);
    expect(isInactivityExpired(lastActivityAt, now, 4_000)).toBe(true);
  });
});
