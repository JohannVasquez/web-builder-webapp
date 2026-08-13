import { NavigationSchema, type NavigationLink } from '../domain/NavigationLink';
import type { NavigationRepository } from '../domain/NavigationRepository';

export class ApiNavigationRepository implements NavigationRepository {
  constructor(private readonly baseUrl: string) {}

  public async findAll(): Promise<NavigationLink[]> {
    const response = await fetch(`${this.baseUrl}/api/navigation`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch navigation: HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    return NavigationSchema.parse(payload);
  }
}
