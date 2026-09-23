import { createSessionStore } from './sessionStore';
import { INACTIVITY_TIMEOUT_MS } from './sessionExpiry';
import type { Session } from '../domain/Session';
import type { SessionStorage } from '../domain/SessionStorage';

describe('createSessionStore', () => {
  const session: Session = {
    token: 'tok',
    user: { id: '018f6f1a-0000-7000-8000-000000000001', email: 'admin@test.cl', name: 'Admin', role: 'owner' },
  };

  const buildStorage = (
    initial: Session | null = null,
    lastActivityAt: number | null = Date.now(),
  ): jest.Mocked<SessionStorage> => ({
    read: jest.fn().mockReturnValue(initial),
    write: jest.fn(),
    clear: jest.fn(),
    readLastActivityAt: jest.fn().mockReturnValue(lastActivityAt),
    writeLastActivityAt: jest.fn(),
  });

  it('lee el almacenamiento una sola vez y devuelve siempre el mismo snapshot', () => {
    const storage = buildStorage(session);
    const store = createSessionStore(storage);

    const first = store.getSnapshot();
    const second = store.getSnapshot();

    expect(first).toBe(second);
    expect(storage.read).toHaveBeenCalledTimes(1);
  });

  it('guarda la sesión, marca actividad y avisa a los suscriptores al iniciar sesión', () => {
    const storage = buildStorage();
    const store = createSessionStore(storage);
    const listener = jest.fn();
    store.subscribe(listener);

    store.set(session);

    expect(storage.write).toHaveBeenCalledWith(session);
    expect(storage.writeLastActivityAt).toHaveBeenCalled();
    expect(store.getSnapshot()).toEqual(session);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('limpia el almacenamiento al cerrar sesión', () => {
    const storage = buildStorage(session);
    const store = createSessionStore(storage);

    store.set(null);

    expect(storage.clear).toHaveBeenCalled();
    expect(store.getSnapshot()).toBeNull();
  });

  it('deja de avisar tras desuscribirse', () => {
    const store = createSessionStore(buildStorage());
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.set(session);

    expect(listener).not.toHaveBeenCalled();
  });

  it('descarta una sesión guardada cuya última actividad ya venció', () => {
    const staleActivity = Date.now() - INACTIVITY_TIMEOUT_MS - 1;
    const storage = buildStorage(session, staleActivity);
    const store = createSessionStore(storage);

    expect(store.getSnapshot()).toBeNull();
    expect(storage.clear).toHaveBeenCalled();
  });

  it('mantiene una sesión guardada cuya última actividad sigue vigente', () => {
    const recentActivity = Date.now() - 1_000;
    const storage = buildStorage(session, recentActivity);
    const store = createSessionStore(storage);

    expect(store.getSnapshot()).toEqual(session);
    expect(storage.clear).not.toHaveBeenCalled();
  });

  it('touch() refresca la actividad solo si hay una sesión activa', () => {
    const storage = buildStorage(null);
    const store = createSessionStore(storage);

    store.touch();
    expect(storage.writeLastActivityAt).not.toHaveBeenCalled();

    store.set(session);
    store.touch();
    expect(storage.writeLastActivityAt).toHaveBeenCalledTimes(2);
  });
});
