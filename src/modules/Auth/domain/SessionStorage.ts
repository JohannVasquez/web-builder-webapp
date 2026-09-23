import type { Session } from './Session';

// Puerto de persistencia de la sesión: la implementación (`localStorage`) vive
// en infrastructure y se inyecta desde `src/app/**`, así presentation no la importa.
export interface SessionStorage {
  read(): Session | null;
  write(session: Session): void;
  clear(): void;
  // Marca de tiempo (epoch ms) de la última interacción: sostiene el cierre por
  // inactividad (SPEC 9.1) y se guarda junto a la sesión, no en memoria del componente.
  readLastActivityAt(): number | null;
  writeLastActivityAt(timestamp: number): void;
}
