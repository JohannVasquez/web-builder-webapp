import type { NavigationLink } from './NavigationLink';

export interface NavigationRepository {
  findAll(): Promise<NavigationLink[]>;
}
