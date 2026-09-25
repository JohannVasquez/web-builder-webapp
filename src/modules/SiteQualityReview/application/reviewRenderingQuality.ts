import type { AdminPage } from '@/modules/Admin/domain/AdminApi';
import type { SiteQualityObservation } from '../domain/SiteQualityObservation';

// Más de este número de imágenes en una Gallery convierte la página en una descarga masiva.
const GALLERY_IMAGE_LIMIT = 20;

// Más de este número de fotos en un Hero carousel hacen que el JS las tenga todas en memoria
// aunque el visitante nunca llegue a verlas.
const HERO_CAROUSEL_LIMIT = 5;

// Más de este número de bloques con galería en la misma página multiplica las peticiones de
// imágenes que el navegador tiene que resolver antes de mostrar la pantalla.
const IMAGE_HEAVY_BLOCKS_LIMIT = 3;

// Tipos de bloque que cargan varias imágenes propias (no iconos ni avatares decorativos).
const IMAGE_HEAVY_TYPES = new Set(['Gallery', 'BeforeAfter']);

function countImages(props: Record<string, unknown>): number {
  const images = props['images'];
  if (Array.isArray(images)) {
    return images.length;
  }
  return 0;
}

// Comprueba los criterios de rendimiento e imagen que dependen de los datos de página,
// no del sitio renderizado. Devuelve observaciones en el mismo formato que la API para
// que se puedan concatenar sin transformación.
export function reviewRenderingQuality(pages: readonly AdminPage[]): SiteQualityObservation[] {
  const observations: SiteQualityObservation[] = [];

  for (const page of pages) {
    if (!page.isPublished) {
      continue;
    }

    // 1. Galería con demasiadas imágenes: el navegador las resuelve todas al cargar la página.
    for (const section of page.sections) {
      if (section.type === 'Gallery') {
        const count = countImages(section.props);
        if (count > GALLERY_IMAGE_LIMIT) {
          observations.push({
            what: `Galería con ${count} imágenes en una sola página`,
            where: `Página "${page.title}", bloque Galería`,
            severity: 'improvable',
            fix: `Divide la galería en varias o reduce las imágenes a ${GALLERY_IMAGE_LIMIT} como máximo para que la página cargue rápido.`,
          });
        }
      }
    }

    // 2. Carrusel del Hero con demasiadas fotos: el JS las carga todas aunque no se vean.
    for (const section of page.sections) {
      if (section.type === 'Hero') {
        const count = countImages(section.props);
        if (count > HERO_CAROUSEL_LIMIT) {
          observations.push({
            what: `Carrusel de portada con ${count} imágenes`,
            where: `Página "${page.title}", bloque Hero`,
            severity: 'improvable',
            fix: `Usa ${HERO_CAROUSEL_LIMIT} imágenes o menos en el carrusel de portada para que la primera imagen cargue rápido.`,
          });
        }
      }
    }

    // 3. Página con muchos bloques con galería: las imágenes iniciales de cada bloque se
    // cargan de inmediato y suman en el tiempo de carga total.
    const heavyCount = page.sections.filter((s) => IMAGE_HEAVY_TYPES.has(s.type)).length;
    if (heavyCount > IMAGE_HEAVY_BLOCKS_LIMIT) {
      observations.push({
        what: `${heavyCount} bloques con galería en la misma página`,
        where: `Página "${page.title}"`,
        severity: 'improvable',
        fix: `Distribuye los bloques con muchas imágenes entre varias páginas para que ninguna quede pesada.`,
      });
    }
  }

  return observations;
}
