import { notFound, permanentRedirect } from 'next/navigation';
import type { RedirectService } from '../application/RedirectService';

/**
 * Reemplazo de `notFound()` que, antes de mostrar el error, verifica en la API
 * si existe una redirección para la ruta solicitada. Si existe, responde con un 301.
 * De lo contrario, cae en el 404 normal.
 */
export async function notFoundWithRedirect(
  redirectService: RedirectService,
  path: string,
): Promise<never> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const redirect = await redirectService.resolve(normalized);

  if (redirect !== null) {
    permanentRedirect(redirect.toPath);
  }

  notFound();
}
