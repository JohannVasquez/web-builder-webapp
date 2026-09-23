// Mismo criterio en toda la biblioteca de medios: bytes crudos por debajo de 1 KB, y
// KB/MB redondeados a algo legible arriba de eso.
export const formatMediaSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Sin texto alternativo, la imagen es invisible para un lector de pantalla (SPEC 6.3).
export const isMissingAlt = (alt: string | null): boolean => alt === null || alt.trim() === '';

// Query string para el buscador de la biblioteca: vacío no manda `search`.
export const buildMediaSearchQuery = (search: string): string => {
  const trimmed = search.trim();
  return trimmed === '' ? '' : `?search=${encodeURIComponent(trimmed)}`;
};
