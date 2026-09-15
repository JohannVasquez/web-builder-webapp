import { SessionSchema, SessionExpiredError, type Session } from '../domain/Session';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos.');
    this.name = 'InvalidCredentialsError';
  }
}

export class TooManyAttemptsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TooManyAttemptsError';
  }
}

/**
 * Cliente del módulo Auth de la API. No guarda nada: quien decide dónde vive
 * la sesión es el `SessionProvider`, con el `SessionStorage` que le inyecten.
 */
export class AuthService {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: FetchLike = (input, init) => fetch(input, init),
  ) {}

  public async login(email: string, password: string): Promise<Session> {
    const response = await this.fetchFn(`${this.baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 401) {
      throw new InvalidCredentialsError();
    }
    if (response.status === 429) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new TooManyAttemptsError(
        body.message ??
          'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentar.',
      );
    }
    if (!response.ok) {
      throw new Error('No pudimos iniciar sesión. Inténtalo nuevamente en unos minutos.');
    }

    return SessionSchema.parse(await response.json());
  }

  /** Confirma que el token sigue vigente. Lanza `SessionExpiredError` si no. */
  public async me(token: string): Promise<Session['user']> {
    const response = await this.fetchFn(`${this.baseUrl}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      throw new SessionExpiredError();
    }
    if (!response.ok) {
      throw new Error('No pudimos verificar tu sesión.');
    }

    const body = (await response.json()) as unknown;
    return SessionSchema.shape.user.parse((body as { user: unknown }).user);
  }
}
