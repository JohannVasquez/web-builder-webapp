import {
  SessionSchema,
  SessionExpiredError,
  MeUserSchema,
  type Session,
  type MeUser,
} from '../domain/Session';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class InvalidCredentialsError extends Error {
  // El servidor distingue "credenciales malas" de "cuenta desactivada" en este mismo mensaje;
  // por eso se recibe como parámetro en vez de fijarlo aquí.
  constructor(message = 'Correo o contraseña incorrectos.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class TooManyAttemptsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TooManyAttemptsError';
  }
}

// Cliente del módulo Auth de la API: no guarda nada, quien decide dónde vive
// la sesión es el `SessionProvider` con el `SessionStorage` que le inyecten.
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
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new InvalidCredentialsError(body.message);
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

  // Confirma que el token sigue vigente; lanza `SessionExpiredError` si no.
  // `/api/admin/me` no devuelve `email`, así que usa su propio esquema y no el de la sesión.
  public async me(token: string): Promise<MeUser> {
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
    return MeUserSchema.parse((body as { user: unknown }).user);
  }

  // Siempre responde 200 con el mismo mensaje, exista o no la cuenta: así no se puede
  // usar para averiguar qué correos están registrados.
  public async forgotPassword(email: string): Promise<string> {
    const response = await this.fetchFn(
      `${this.baseUrl}/api/admin/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
    );
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    return (
      body.message ??
      'Si ese correo tiene una cuenta, te llegará un enlace para cambiar la contraseña.'
    );
  }

  public async resetPassword(token: string, password: string): Promise<string> {
    const response = await this.fetchFn(`${this.baseUrl}/api/admin/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      issues?: { path: string; message: string }[];
    };
    if (!response.ok) {
      throw new Error(
        body.message ??
          body.issues?.[0]?.message ??
          'No pudimos actualizar tu contraseña. Inténtalo nuevamente.',
      );
    }
    return body.message ?? 'Contraseña actualizada.';
  }
}
