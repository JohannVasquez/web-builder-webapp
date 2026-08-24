import { z } from 'zod';
import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import { ContactSchema, type ContactInput } from '../domain/ContactSchema';

export interface ContactResult {
  readonly success: boolean;
  readonly message: string;
}

const ContactResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class ContactService {
  constructor(
    private readonly baseUrl: string,
    /**
     * Dominio del visitante (ej. `electrica.localhost`). Cuando el navegador
     * llama a la API cross-origin (sin Caddy), el `Host` que ve la API es el
     * suyo propio, así que el tenant debe viajar en este header — igual que
     * hacen los server components. Vía Caddy el header simplemente coincide
     * con el `Host` y no cambia nada.
     */
    private readonly tenantDomain?: string,
    private readonly fetchFn: FetchLike = (input, init) => fetch(input, init),
  ) {}

  public async sendContact(input: ContactInput): Promise<ContactResult> {
    const payload = ContactSchema.parse(input);

    const response = await this.fetchFn(`${this.baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.tenantDomain === undefined
          ? {}
          : { [TENANT_DOMAIN_HEADER]: this.tenantDomain }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Contact request failed: HTTP ${response.status}`);
    }

    const body: unknown = await response.json();
    const parsed = ContactResultSchema.safeParse(body);
    if (!parsed.success) {
      return { success: true, message: 'Mensaje enviado correctamente.' };
    }
    return parsed.data;
  }
}
