// El panel cierra la sesión sola tras este tiempo sin interacción (SPEC 9.1).
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

// Sin marca de actividad no hay forma de saber si la sesión sigue vigente: se trata como vencida.
export const isInactivityExpired = (
  lastActivityAt: number | null,
  now: number,
  timeoutMs: number = INACTIVITY_TIMEOUT_MS,
): boolean => lastActivityAt === null || now - lastActivityAt >= timeoutMs;
