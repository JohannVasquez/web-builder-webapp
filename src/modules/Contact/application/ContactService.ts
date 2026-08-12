import { z } from 'zod';
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
    private readonly fetchFn: FetchLike = (input, init) => fetch(input, init),
  ) {}

  public async sendContact(input: ContactInput): Promise<ContactResult> {
    const payload = ContactSchema.parse(input);

    const response = await this.fetchFn(`${this.baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
