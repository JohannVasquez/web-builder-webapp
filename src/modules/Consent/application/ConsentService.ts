import type { ConsentDecision } from '../domain/Consent';

export type ConsentSource = 'cookies' | 'contact' | 'newsletter';

/**
 * Manda la decisión al registro de la API, que es el que sirve como prueba. El `localStorage`
 * guarda una copia para no volver a preguntar, pero no acredita nada.
 *
 * Vive en `application` y no en `infrastructure` por la misma razón que `ContactService`: lo
 * usa un componente de cliente, y la presentación no puede depender de infraestructura.
 */
export class ConsentService {
  constructor(private readonly apiBaseUrl: string) {}

  /**
   * Nunca lanza: si la API no responde, la decisión de la persona igual se respeta en el
   * navegador. Bloquear la navegación por un registro fallido sería peor para todos.
   */
  public async record(
    decision: ConsentDecision,
    subject: string,
    source: ConsentSource,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          source,
          purposes: decision.purposes,
          textVersion: decision.textVersion,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
