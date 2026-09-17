import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import {
  ApiErrorSchema,
  QuoteResponseSchema,
  type QuoteRequest,
  type QuoteResponse,
} from '../domain/Quote';
import {
  CheckoutResponseSchema,
  type CheckoutRequest,
  type CheckoutResponse,
} from '../domain/Checkout';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const GENERIC_ERROR_MESSAGE = 'No pudimos calcular tu pedido. Inténtalo nuevamente.';

// A diferencia de `StoreService` (lecturas que se tragan el error y devuelven vacío), acá el
// error SÍ tiene que llegar a la pantalla: un 400 de `/quote` o `/checkout` trae un mensaje
// escrito para quien compra (ej. "Necesitamos tu dirección para despachar el pedido.") y
// ocultarlo dejaría a la persona sin saber qué corregir.
export class StoreOrderService {
  constructor(
    private readonly baseUrl: string,
    // Igual que `ContactService`: quien llama desde el navegador manda el dominio del
    // visitante a mano, porque la API ve su propio `Host` en vez del de la visita.
    private readonly tenantDomain?: string,
    private readonly fetchFn: FetchLike = (input, init) => fetch(input, init),
  ) {}

  private headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.tenantDomain === undefined
        ? {}
        : { [TENANT_DOMAIN_HEADER]: this.tenantDomain }),
    };
  }

  private async post<T>(
    path: string,
    body: unknown,
    schema: { parse: (v: unknown) => T },
  ): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const parsedError = ApiErrorSchema.safeParse(payload);
      throw new Error(
        parsedError.success ? parsedError.data.message : GENERIC_ERROR_MESSAGE,
      );
    }

    const payload: unknown = await response.json();
    return schema.parse(payload);
  }

  public async quote(request: QuoteRequest): Promise<QuoteResponse> {
    return this.post('/api/store/quote', request, QuoteResponseSchema);
  }

  public async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return this.post('/api/store/checkout', request, CheckoutResponseSchema);
  }
}
