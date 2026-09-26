import { cookies } from 'next/headers';
import { DEMO_TOKEN_COOKIE, isDemoHost, isDemoToken } from '@/shared/config/demo';

// Token de demo de la visita actual, leído de la cookie httpOnly que deja `/demo/<token>`.
// Un valor con otra forma se ignora: no vale la pena mandarle basura a la API.
export const readDemoToken = async (): Promise<string | undefined> => {
  try {
    const value = (await cookies()).get(DEMO_TOKEN_COOKIE)?.value;
    return isDemoToken(value) ? value : undefined;
  } catch {
    // Fuera del contexto de una petición (scripts, pruebas) no hay cookie que leer.
    return undefined;
  }
};

// Si esta visita es (o podría ser) a una demo de prospecto: por el host, aunque todavía no
// haya canjeado el enlace, o porque trae la cookie de un canje.
export const isDemoRequest = async (tenantDomain: string): Promise<boolean> =>
  isDemoHost(tenantDomain) || (await readDemoToken()) !== undefined;
