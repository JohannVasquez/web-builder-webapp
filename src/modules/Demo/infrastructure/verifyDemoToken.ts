import { getApiBaseUrl } from '@/shared/config/api';
import {
  DEMO_RESPONSE_HEADER,
  DEMO_TOKEN_HEADER,
  isDemoToken,
} from '@/shared/config/demo';
import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

// Un enlace de demo vale si la API sirve el sitio con ese token Y lo marca como demo. Lo
// segundo importa: un cliente normal ignora `X-Demo-Token` y respondería 200 igual, y canjear
// ahí dejaría una cookie que desactiva la caché de quien la tenga sin motivo.
//
// Todo lo demás (token de otra demo, vencido, descartado, API caída) es simplemente "no":
// la API no distingue esos casos a propósito y el sitio tampoco.
export const verifyDemoToken = async (
  tenantDomain: string,
  token: string,
  fetchFn: FetchLike = (input, init) => fetch(input, init),
): Promise<boolean> => {
  if (!isDemoToken(token)) {
    return false;
  }
  try {
    const response = await fetchFn(`${getApiBaseUrl()}/api/settings`, {
      headers: { [TENANT_DOMAIN_HEADER]: tenantDomain, [DEMO_TOKEN_HEADER]: token },
      cache: 'no-store',
    });
    return response.ok && response.headers.get(DEMO_RESPONSE_HEADER) === 'true';
  } catch {
    return false;
  }
};
