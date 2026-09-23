import type { SessionStorage } from '../domain/SessionStorage';
import type { Session } from '../domain/Session';
import {
  clearSession,
  readSession,
  writeSession,
  readLastActivityAt,
  writeLastActivityAt,
  clearLastActivityAt,
} from './sessionStorage';

export class LocalSessionStorage implements SessionStorage {
  public read(): Session | null {
    return readSession();
  }

  public write(session: Session): void {
    writeSession(session);
  }

  public clear(): void {
    clearSession();
    clearLastActivityAt();
  }

  public readLastActivityAt(): number | null {
    return readLastActivityAt();
  }

  public writeLastActivityAt(timestamp: number): void {
    writeLastActivityAt(timestamp);
  }
}
