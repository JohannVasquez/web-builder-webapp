import { z } from 'zod';
import { reviewRenderingQuality } from '@/modules/SiteQualityReview/application/reviewRenderingQuality';
import type { SiteQualityObservation } from '@/modules/SiteQualityReview/domain/SiteQualityObservation';
import type { AdminPage } from '../domain/AdminApi';

// La API devuelve observaciones con la misma forma que SiteQualityObservation para
// que se puedan concatenar directamente sin transformación.
export const SiteQualityObservationSchema = z.object({
  what: z.string(),
  where: z.string(),
  severity: z.enum(['blocking', 'improvable']),
  fix: z.string(),
});

export const SiteQualityReviewResponseSchema = z.object({
  observations: z.array(SiteQualityObservationSchema),
});

export type SiteQualityReviewResponse = z.infer<typeof SiteQualityReviewResponseSchema>;

// Combina las observaciones de la API (reglas de negocio del lado servidor) con las
// que detecta el cliente sobre los datos de renderizado, en una sola lista ordenada:
// las bloqueantes primero para que se vean sin hacer scroll.
export function mergeObservations(
  apiObservations: readonly SiteQualityObservation[],
  pages: readonly AdminPage[],
): SiteQualityObservation[] {
  const renderingObservations = reviewRenderingQuality(pages);
  const all = [...apiObservations, ...renderingObservations];
  return all.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === 'blocking' ? -1 : 1;
  });
}
