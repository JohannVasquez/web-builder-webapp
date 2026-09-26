import type { Redirect } from './Redirect';

export interface RedirectRepository {
  resolve(path: string): Promise<Redirect | null>;
}
