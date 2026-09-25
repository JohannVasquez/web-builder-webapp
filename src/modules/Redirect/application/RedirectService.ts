import type { Redirect } from '../domain/Redirect';
import type { RedirectRepository } from '../domain/RedirectRepository';

export class RedirectService {
  constructor(private readonly repository: RedirectRepository) {}

  public async resolve(path: string): Promise<Redirect | null> {
    return this.repository.resolve(path);
  }
}
