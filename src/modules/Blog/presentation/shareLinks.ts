// Construcción pura de los enlaces de "compartir": sin tocar el DOM, para poder probarla sin
// navegador. `url` debe venir absoluta: WhatsApp y X no resuelven bien una ruta relativa.
export interface ShareLinks {
  readonly whatsapp: string;
  readonly x: string;
  readonly linkedin: string;
}

export function buildShareLinks(url: string, title: string): ShareLinks {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}
