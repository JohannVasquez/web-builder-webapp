import type { Session } from './Session';

/**
 * Puerto de persistencia de la sesión. La implementación concreta
 * (`localStorage`) vive en infrastructure y se inyecta al `SessionProvider`
 * desde `src/app/**`, que es la raíz de composición del frontend: así
 * presentation no importa infrastructure.
 */
export interface SessionStorage {
  read(): Session | null;
  write(session: Session): void;
  clear(): void;
}
