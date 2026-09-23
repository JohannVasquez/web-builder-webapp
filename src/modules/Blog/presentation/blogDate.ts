// Fecha de publicación en formato largo, en español: "16 de septiembre de 2026".
// Una fecha inválida devuelve texto vacío en vez de "Invalid Date" en la pantalla.
export const formatPublishedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};
