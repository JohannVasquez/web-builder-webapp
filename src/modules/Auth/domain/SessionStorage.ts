import type { Session } from './Session';

// Puerto de persistencia de la sesión: la implementación (`localStorage`) vive
// en infrastructure y se inyecta desde `src/app/**`, así presentation no la importa.
export interface SessionStorage {
  read(): Session | null;
  write(session: Session): void;
  clear(): void;
}
