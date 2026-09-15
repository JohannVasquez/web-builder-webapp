import { createSessionStore } from './sessionStore';
import type { Session } from '../domain/Session';
import type { SessionStorage } from '../domain/SessionStorage';

describe('createSessionStore', () => {
  const session: Session = {
    token: 'tok',
    user: { id: 1, email: 'admin@test.cl', name: 'Admin' },
  };

  const buildStorage = (initial: Session | null = null): jest.Mocked<SessionStorage> => ({
    read: jest.fn().mockReturnValue(initial),
    write: jest.fn(),
    clear: jest.fn(),
  });

  it('lee el almacenamiento una sola vez y devuelve siempre el mismo snapshot', () => {
    const storage = buildStorage(session);
    const store = createSessionStore(storage);

    const first = store.getSnapshot();
    const second = store.getSnapshot();

    expect(first).toBe(second);
    expect(storage.read).toHaveBeenCalledTimes(1);
  });

  it('guarda la sesión y avisa a los suscriptores al iniciar sesión', () => {
    const storage = buildStorage();
    const store = createSessionStore(storage);
    const listener = jest.fn();
    store.subscribe(listener);

    store.set(session);

    expect(storage.write).toHaveBeenCalledWith(session);
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
});
