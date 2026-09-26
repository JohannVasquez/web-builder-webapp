import { SessionExpiredError } from '@/modules/Auth/domain/Session';
import type { z } from 'zod';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

// Error con los campos que el servidor rechazó, para poder marcarlos en el formulario
// en vez de mostrar un texto genérico que no le dice nada a quien está editando.
export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly issues: readonly ValidationIssue[] = [],
    // Un 409 por dirección ocupada trae la siguiente libre: el panel la ofrece con un clic.
    public readonly suggestedSlug: string | null = null,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

export class AdminApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken: () => string | null,
    private readonly fetchFn: FetchLike = (input, init) => fetch(input, init),
  ) {}

  public async get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    return schema.parse(await this.send('GET', path));
  }

  public async post<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
    return schema.parse(await this.send('POST', path, body));
  }

  public async patch<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
    return schema.parse(await this.send('PATCH', path, body));
  }

  public async put<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
    return schema.parse(await this.send('PUT', path, body));
  }

  // Algunas rutas piden la confirmación en el cuerpo (borrar una demo lleva `{ confirm: true }`).
  public async remove(path: string, body?: unknown): Promise<void> {
    await this.send('DELETE', path, body);
  }

  // No usa `send`: un `FormData` no lleva `Content-Type` a mano (el navegador pone el
  // boundary) ni se serializa con `JSON.stringify`.
  public async upload<T>(path: string, file: File, schema: z.ZodType<T>): Promise<T> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: token === null ? {} : { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return schema.parse(await this.parseResponse(response));
  }

  public async downloadCsv(path: string): Promise<Blob> {
    const token = this.getToken();
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: token === null ? {} : { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      throw new SessionExpiredError();
    }
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      throw this.toError(payload, response.status);
    }
    return response.blob();
  }

  private async send(method: string, path: string, body?: unknown): Promise<unknown> {
    const token = this.getToken();
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method,
      headers: {
        ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return this.parseResponse(response);
  }

  private async parseResponse(response: Response): Promise<unknown> {
    if (response.status === 401) {
      throw new SessionExpiredError();
    }
    if (response.status === 204) {
      return undefined;
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw this.toError(payload, response.status);
    }
    return payload;
  }

  private toError(payload: unknown, status: number): AdminApiError {
    const body = (payload ?? {}) as {
      message?: string;
      issues?: ValidationIssue[];
      suggestedSlug?: unknown;
    };

    if (body.issues !== undefined && body.issues.length > 0) {
      return new AdminApiError(
        'Revisa los campos marcados y vuelve a guardar.',
        status,
        body.issues,
      );
    }
    return new AdminApiError(
      body.message ?? 'No pudimos completar la acción. Inténtalo nuevamente.',
      status,
      [],
      typeof body.suggestedSlug === 'string' ? body.suggestedSlug : null,
    );
  }
}
