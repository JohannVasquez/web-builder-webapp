export interface PageVersionView {
  readonly id: number;
  readonly summary: string;
  readonly actorType: string;
  readonly actorName: string;
  readonly createdAt: string;
}

// Quién hizo el cambio. Distinguir la persona del agente importa: si algo quedó raro,
// saber que lo hizo un agente cambia dónde se busca el problema.
export const describeVersionActor = (version: PageVersionView): string =>
  version.actorType === 'apiKey'
    ? `${version.actorName} (agente)`
    : version.actorName;

export const formatVersionDate = (iso: string): string =>
  new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });

// La primera de la lista es el estado actual: restaurarla no haría nada, así que no se
// ofrece. Las versiones vienen de la más nueva a la más vieja.
export const isCurrentVersion = (index: number): boolean => index === 0;

export const describeVersion = (version: PageVersionView): string =>
  `${version.summary} · ${describeVersionActor(version)} · ${formatVersionDate(version.createdAt)}`;
