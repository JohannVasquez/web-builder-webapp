export const translatePostStatus = (status: 'draft' | 'published' | 'scheduled'): string => {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'published':
      return 'Publicada';
    case 'scheduled':
      return 'Programada';
  }
};

export const formatPostDate = (isoDate: string | null): string => {
  if (isoDate === null) {
    return 'Sin fecha';
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 'Fecha inválida';
  }
  // Se usa formato dd/mm/yyyy hh:mm en hora local
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const isScheduledPostVisible = (
  status: 'draft' | 'published' | 'scheduled',
  publishedAt: string | null,
  now: Date = new Date(),
): boolean => {
  if (status !== 'scheduled' || publishedAt === null) {
    return false;
  }
  const publishDate = new Date(publishedAt);
  if (Number.isNaN(publishDate.getTime())) {
    return false;
  }
  return publishDate <= now;
};

export const generateSlugFromTitle = (title: string): string => {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const pad = (value: number): string => String(value).padStart(2, '0');

// Un `<input type="datetime-local">` trabaja en hora local sin zona, y la API guarda en UTC.
// Cortar el ISO con `slice(0, 16)` mostraría la hora UTC como si fuera local, y cada guardado
// sin tocar la fecha la correría varias horas.
export const toLocalDateTimeInput = (iso: string | null): string => {
  if (iso === null || iso === '') {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
