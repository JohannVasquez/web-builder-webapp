import { SessionExpiredError } from '@/modules/Auth/domain/Session';
import { AdminApiError } from './AdminApiClient';

export interface AdminErrorMessage {
  readonly message: string;
  readonly issues: readonly { path: string; message: string }[];
}

// Mismo criterio en toda pantalla del panel: sesión caducada y error de validación se
// explican con sus propias palabras; cualquier otra causa cae al mensaje genérico.
export const describeAdminError = (
  cause: unknown,
  fallback: string,
): AdminErrorMessage => {
  if (cause instanceof SessionExpiredError) {
    return { message: cause.message, issues: [] };
  }
  if (cause instanceof AdminApiError) {
    return { message: cause.message, issues: cause.issues };
  }
  return { message: fallback, issues: [] };
};
