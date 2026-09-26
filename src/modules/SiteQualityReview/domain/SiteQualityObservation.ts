// Mismo contrato que SiteQualityObservation de la API; las observaciones de ambos lados
// se concatenan en una sola lista antes de presentarlas.
export interface SiteQualityObservation {
  readonly what: string;
  readonly where: string;
  readonly severity: 'blocking' | 'improvable';
  readonly fix: string;
}
