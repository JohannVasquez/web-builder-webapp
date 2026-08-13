import { DEFAULT_NAVIGATION_LINKS, type NavigationLink } from '../domain/NavigationLink';
import type { NavigationRepository } from '../domain/NavigationRepository';

export class NavigationService {
  constructor(private readonly repository: NavigationRepository) {}

  /**
   * Devuelve los enlaces del menú. Si la API no está disponible, entrega un
   * menú mínimo para que el layout siga renderizando.
   */
  public async getLinks(): Promise<readonly NavigationLink[]> {
    try {
      return await this.repository.findAll();
    } catch {
      return DEFAULT_NAVIGATION_LINKS;
    }
  }
}
