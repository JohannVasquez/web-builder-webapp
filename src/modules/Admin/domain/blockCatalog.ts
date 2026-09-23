export type BlockFamily =
  'inicio' | 'contenido' | 'confianza' | 'catalogo' | 'contacto' | 'tienda';

export interface BlockCatalogEntry {
  readonly type: string;
  readonly label: string;
  readonly description: string;
  readonly family: BlockFamily;
}

// Los 11 tipos de `COMPONENT_MAP` (src/modules/Page/presentation/componentMap.ts), en
// español y con una frase de para qué sirve cada uno, para el catálogo de "agregar bloque".
export const BLOCK_CATALOG: readonly BlockCatalogEntry[] = [
  {
    type: 'Hero',
    label: 'Portada',
    description:
      'Bloque grande de bienvenida con título, imagen de fondo y botones de acción.',
    family: 'inicio',
  },
  {
    type: 'Features',
    label: 'Características',
    description:
      'Grilla de tarjetas con ícono, título y descripción para listar cualidades.',
    family: 'catalogo',
  },
  {
    type: 'CallToAction',
    label: 'Llamado a la acción',
    description: 'Franja con un mensaje corto y un botón destacado hacia otra página.',
    family: 'inicio',
  },
  {
    type: 'TextBlock',
    label: 'Texto',
    description: 'Párrafo de contenido libre, opcionalmente con una imagen al costado.',
    family: 'contenido',
  },
  {
    type: 'ContactForm',
    label: 'Formulario de contacto',
    description:
      'Formulario de contacto con datos de la empresa (teléfono, WhatsApp, horario).',
    family: 'contacto',
  },
  {
    type: 'Stats',
    label: 'Cifras',
    description:
      'Números destacados en fila (ej. años de experiencia, clientes atendidos).',
    family: 'confianza',
  },
  {
    type: 'ServiceCards',
    label: 'Tarjetas de servicios',
    description:
      'Grilla de servicios con ícono, lista de puntos y enlace a más información.',
    family: 'catalogo',
  },
  {
    type: 'SplitHighlights',
    label: 'Lista con imagen',
    description: 'Lista de puntos destacados junto a una foto lateral.',
    family: 'contenido',
  },
  {
    type: 'Testimonials',
    label: 'Testimonios',
    description: 'Carrusel de citas de clientes con calificación en estrellas.',
    family: 'confianza',
  },
  {
    type: 'LocationMap',
    label: 'Ubicación',
    description: 'Dirección con enlace a Google Maps.',
    family: 'contacto',
  },
  {
    type: 'Columns',
    label: 'Columnas',
    description:
      'De 1 a 4 columnas, cada una con foto y/o texto, para pasos o comparaciones.',
    family: 'contenido',
  },
  {
    type: 'Faq',
    label: 'Preguntas frecuentes',
    description:
      'Preguntas que se despliegan al tocarlas. Resuelve dudas sin alargar la página.',
    family: 'contenido',
  },
  {
    type: 'Pricing',
    label: 'Planes y precios',
    description:
      'Tarjetas comparativas con lista de características y un plan destacado.',
    family: 'catalogo',
  },
  {
    type: 'Gallery',
    label: 'Galería de imágenes',
    description: 'Grilla o mosaico de fotos, con vista ampliada al tocar una.',
    family: 'catalogo',
  },
  {
    type: 'LogoCloud',
    label: 'Logos de clientes',
    description: 'Fila de logos o cinta en movimiento, para mostrar con quién trabajan.',
    family: 'confianza',
  },
  {
    type: 'Team',
    label: 'Equipo',
    description: 'Fotos, nombres, cargos y redes de las personas detrás del negocio.',
    family: 'confianza',
  },
  {
    type: 'Timeline',
    label: 'Proceso o línea de tiempo',
    description: 'Pasos numerados o hitos con fecha, para explicar cómo se trabaja.',
    family: 'contenido',
  },
  {
    type: 'Video',
    label: 'Video',
    description: 'Video de YouTube, Vimeo o propio, con portada y carga diferida.',
    family: 'inicio',
  },
  {
    type: 'AnnouncementBar',
    label: 'Barra de anuncio',
    description: 'Franja con un mensaje breve y un enlace, por ejemplo una promoción.',
    family: 'inicio',
  },
  {
    type: 'BeforeAfter',
    label: 'Antes y después',
    description: 'Comparador deslizable entre dos imágenes, para mostrar un resultado.',
    family: 'catalogo',
  },
  {
    type: 'OpeningHours',
    label: 'Horarios de atención',
    description: 'Días y horarios, indicando si el negocio está abierto en este momento.',
    family: 'contenido',
  },
  {
    type: 'Newsletter',
    label: 'Suscripción a novedades',
    description: 'Captura de correo con mensaje de confirmación.',
    family: 'inicio',
  },
  {
    type: 'GoogleReviews',
    label: 'Reseñas de Google',
    description: 'Calificación general y reseñas destacadas del negocio.',
    family: 'confianza',
  },
  {
    type: 'LatestPosts',
    label: 'Últimas publicaciones',
    description: 'Últimas entradas del blog del sitio, en tarjetas o en lista.',
    family: 'tienda',
  },
  {
    type: 'FeaturedProducts',
    label: 'Productos destacados',
    description: 'Grilla de productos destacados de la tienda del sitio.',
    family: 'tienda',
  },
];

export const findBlockCatalogEntry = (type: string): BlockCatalogEntry | undefined =>
  BLOCK_CATALOG.find((entry) => entry.type === type);

export const BLOCK_FAMILY_LABELS: Readonly<Record<BlockFamily, string>> = {
  inicio: 'Inicio y llamados a la acción',
  contenido: 'Contenido',
  confianza: 'Confianza y prueba social',
  catalogo: 'Catálogos y ofertas',
  contacto: 'Contacto y ubicación',
  tienda: 'Tienda y blog',
};

const FAMILY_ORDER: readonly BlockFamily[] = [
  'inicio',
  'contenido',
  'confianza',
  'catalogo',
  'contacto',
  'tienda',
];

export interface BlockCatalogGroup {
  readonly family: BlockFamily;
  readonly label: string;
  readonly entries: readonly BlockCatalogEntry[];
}

// Agrupa el catálogo por familia para que "agregar bloque" no sea una lista plana de 25
// ítems: cada familia junta bloques que se usan para lo mismo.
export const groupBlockCatalog = (): readonly BlockCatalogGroup[] =>
  FAMILY_ORDER.map((family) => ({
    family,
    label: BLOCK_FAMILY_LABELS[family],
    entries: BLOCK_CATALOG.filter((entry) => entry.family === family),
  })).filter((group) => group.entries.length > 0);

export type ThumbnailTone = 'accent' | 'solid' | 'muted';

export interface ThumbnailRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly tone: ThumbnailTone;
}

// Miniatura de cada bloque: unos pocos rectángulos, en un lienzo de 100x60, que insinúan su
// forma real (una portada es una franja grande con un botón, una grilla de características
// son tres cuadritos, etc.). No es una captura de pantalla, es un esquema.
const BLOCK_THUMBNAILS: Readonly<Record<string, readonly ThumbnailRect[]>> = {
  Hero: [
    { x: 4, y: 6, width: 92, height: 48, tone: 'muted' },
    { x: 10, y: 16, width: 50, height: 6, tone: 'solid' },
    { x: 10, y: 26, width: 34, height: 4, tone: 'solid' },
    { x: 10, y: 36, width: 20, height: 8, tone: 'accent' },
  ],
  Features: [
    { x: 30, y: 6, width: 40, height: 5, tone: 'solid' },
    { x: 8, y: 18, width: 25, height: 25, tone: 'muted' },
    { x: 37.5, y: 18, width: 25, height: 25, tone: 'accent' },
    { x: 67, y: 18, width: 25, height: 25, tone: 'muted' },
  ],
  TextBlock: [
    { x: 6, y: 8, width: 40, height: 44, tone: 'muted' },
    { x: 52, y: 10, width: 30, height: 5, tone: 'solid' },
    { x: 52, y: 19, width: 42, height: 3, tone: 'solid' },
    { x: 52, y: 25, width: 42, height: 3, tone: 'solid' },
    { x: 52, y: 31, width: 30, height: 3, tone: 'solid' },
  ],
  Testimonials: [
    { x: 8, y: 14, width: 26, height: 32, tone: 'muted' },
    { x: 37, y: 14, width: 26, height: 32, tone: 'accent' },
    { x: 66, y: 14, width: 26, height: 32, tone: 'muted' },
  ],
  ContactForm: [
    { x: 10, y: 8, width: 80, height: 6, tone: 'solid' },
    { x: 10, y: 18, width: 80, height: 8, tone: 'muted' },
    { x: 10, y: 29, width: 80, height: 8, tone: 'muted' },
    { x: 10, y: 40, width: 24, height: 8, tone: 'accent' },
  ],
  CallToAction: [
    { x: 4, y: 10, width: 92, height: 40, tone: 'muted' },
    { x: 14, y: 22, width: 40, height: 6, tone: 'solid' },
    { x: 14, y: 32, width: 28, height: 4, tone: 'solid' },
    { x: 60, y: 24, width: 26, height: 10, tone: 'accent' },
  ],
  Stats: [
    { x: 4, y: 14, width: 20, height: 14, tone: 'solid' },
    { x: 4, y: 32, width: 20, height: 4, tone: 'muted' },
    { x: 28, y: 14, width: 20, height: 14, tone: 'solid' },
    { x: 28, y: 32, width: 20, height: 4, tone: 'muted' },
    { x: 52, y: 14, width: 20, height: 14, tone: 'accent' },
    { x: 52, y: 32, width: 20, height: 4, tone: 'muted' },
    { x: 76, y: 14, width: 20, height: 14, tone: 'solid' },
    { x: 76, y: 32, width: 20, height: 4, tone: 'muted' },
  ],
  ServiceCards: [
    { x: 32, y: 4, width: 36, height: 5, tone: 'solid' },
    { x: 6, y: 14, width: 27, height: 40, tone: 'muted' },
    { x: 36.5, y: 14, width: 27, height: 40, tone: 'muted' },
    { x: 67, y: 14, width: 27, height: 40, tone: 'muted' },
    { x: 15, y: 19, width: 9, height: 9, tone: 'accent' },
    { x: 45.5, y: 19, width: 9, height: 9, tone: 'accent' },
    { x: 76, y: 19, width: 9, height: 9, tone: 'accent' },
  ],
  SplitHighlights: [
    { x: 52, y: 6, width: 44, height: 48, tone: 'muted' },
    { x: 6, y: 10, width: 34, height: 5, tone: 'solid' },
    { x: 6, y: 22, width: 4, height: 4, tone: 'accent' },
    { x: 13, y: 22, width: 30, height: 4, tone: 'solid' },
    { x: 6, y: 30, width: 4, height: 4, tone: 'accent' },
    { x: 13, y: 30, width: 30, height: 4, tone: 'solid' },
    { x: 6, y: 38, width: 4, height: 4, tone: 'accent' },
    { x: 13, y: 38, width: 30, height: 4, tone: 'solid' },
  ],
  LocationMap: [
    { x: 6, y: 12, width: 34, height: 5, tone: 'solid' },
    { x: 6, y: 22, width: 30, height: 4, tone: 'muted' },
    { x: 6, y: 30, width: 26, height: 4, tone: 'muted' },
    { x: 6, y: 40, width: 20, height: 8, tone: 'accent' },
    { x: 46, y: 6, width: 50, height: 48, tone: 'muted' },
    { x: 68, y: 26, width: 6, height: 8, tone: 'accent' },
  ],
  Columns: [
    { x: 6, y: 6, width: 27, height: 28, tone: 'muted' },
    { x: 6, y: 38, width: 27, height: 5, tone: 'solid' },
    { x: 36.5, y: 6, width: 27, height: 28, tone: 'muted' },
    { x: 36.5, y: 38, width: 27, height: 5, tone: 'solid' },
    { x: 67, y: 6, width: 27, height: 28, tone: 'muted' },
    { x: 67, y: 38, width: 27, height: 5, tone: 'solid' },
  ],
  Faq: [
    { x: 8, y: 6, width: 84, height: 9, tone: 'muted' },
    { x: 84, y: 8.5, width: 4, height: 4, tone: 'accent' },
    { x: 8, y: 17, width: 84, height: 9, tone: 'muted' },
    { x: 84, y: 19.5, width: 4, height: 4, tone: 'accent' },
    { x: 8, y: 28, width: 84, height: 9, tone: 'muted' },
    { x: 84, y: 30.5, width: 4, height: 4, tone: 'accent' },
    { x: 8, y: 39, width: 84, height: 9, tone: 'muted' },
    { x: 84, y: 41.5, width: 4, height: 4, tone: 'accent' },
  ],
  Pricing: [
    { x: 8, y: 20, width: 26, height: 26, tone: 'muted' },
    { x: 37, y: 8, width: 26, height: 44, tone: 'accent' },
    { x: 66, y: 20, width: 26, height: 26, tone: 'muted' },
  ],
  Gallery: [
    { x: 6, y: 6, width: 28, height: 24, tone: 'muted' },
    { x: 36, y: 6, width: 28, height: 24, tone: 'muted' },
    { x: 66, y: 6, width: 28, height: 24, tone: 'muted' },
    { x: 6, y: 34, width: 28, height: 24, tone: 'muted' },
    { x: 36, y: 34, width: 28, height: 24, tone: 'muted' },
    { x: 66, y: 34, width: 28, height: 24, tone: 'muted' },
  ],
  LogoCloud: [
    { x: 6, y: 26, width: 16, height: 8, tone: 'muted' },
    { x: 24, y: 26, width: 16, height: 8, tone: 'muted' },
    { x: 42, y: 26, width: 16, height: 8, tone: 'muted' },
    { x: 60, y: 26, width: 16, height: 8, tone: 'muted' },
    { x: 78, y: 26, width: 16, height: 8, tone: 'muted' },
  ],
  Team: [
    { x: 12, y: 8, width: 16, height: 16, tone: 'muted' },
    { x: 10, y: 28, width: 20, height: 5, tone: 'solid' },
    { x: 43, y: 8, width: 16, height: 16, tone: 'muted' },
    { x: 41, y: 28, width: 20, height: 5, tone: 'solid' },
    { x: 74, y: 8, width: 16, height: 16, tone: 'muted' },
    { x: 72, y: 28, width: 20, height: 5, tone: 'solid' },
  ],
  Timeline: [
    { x: 8, y: 24, width: 6, height: 6, tone: 'accent' },
    { x: 4, y: 34, width: 14, height: 4, tone: 'solid' },
    { x: 32, y: 24, width: 6, height: 6, tone: 'accent' },
    { x: 28, y: 34, width: 14, height: 4, tone: 'solid' },
    { x: 56, y: 24, width: 6, height: 6, tone: 'accent' },
    { x: 52, y: 34, width: 14, height: 4, tone: 'solid' },
    { x: 80, y: 24, width: 6, height: 6, tone: 'accent' },
    { x: 76, y: 34, width: 14, height: 4, tone: 'solid' },
  ],
  Video: [
    { x: 8, y: 6, width: 84, height: 48, tone: 'muted' },
    { x: 8, y: 46, width: 84, height: 4, tone: 'solid' },
    { x: 44, y: 24, width: 12, height: 12, tone: 'accent' },
  ],
  AnnouncementBar: [
    { x: 0, y: 2, width: 100, height: 8, tone: 'accent' },
    { x: 8, y: 4, width: 40, height: 4, tone: 'solid' },
    { x: 70, y: 4, width: 20, height: 4, tone: 'solid' },
  ],
  BeforeAfter: [
    { x: 4, y: 6, width: 44, height: 48, tone: 'muted' },
    { x: 48, y: 6, width: 4, height: 48, tone: 'accent' },
    { x: 52, y: 6, width: 44, height: 48, tone: 'muted' },
  ],
  OpeningHours: [
    { x: 8, y: 6, width: 24, height: 7, tone: 'accent' },
    { x: 36, y: 6, width: 52, height: 7, tone: 'muted' },
    { x: 8, y: 17, width: 24, height: 7, tone: 'solid' },
    { x: 36, y: 17, width: 52, height: 7, tone: 'muted' },
    { x: 8, y: 28, width: 24, height: 7, tone: 'solid' },
    { x: 36, y: 28, width: 52, height: 7, tone: 'muted' },
    { x: 8, y: 39, width: 24, height: 7, tone: 'solid' },
    { x: 36, y: 39, width: 52, height: 7, tone: 'muted' },
  ],
  Newsletter: [
    { x: 20, y: 8, width: 60, height: 6, tone: 'solid' },
    { x: 6, y: 22, width: 56, height: 10, tone: 'muted' },
    { x: 66, y: 22, width: 24, height: 10, tone: 'accent' },
  ],
  GoogleReviews: [
    { x: 31, y: 6, width: 6, height: 6, tone: 'accent' },
    { x: 39, y: 6, width: 6, height: 6, tone: 'accent' },
    { x: 47, y: 6, width: 6, height: 6, tone: 'accent' },
    { x: 55, y: 6, width: 6, height: 6, tone: 'accent' },
    { x: 63, y: 6, width: 6, height: 6, tone: 'accent' },
    { x: 6, y: 18, width: 44, height: 36, tone: 'muted' },
    { x: 52, y: 18, width: 44, height: 36, tone: 'muted' },
  ],
  LatestPosts: [
    { x: 6, y: 6, width: 27, height: 24, tone: 'muted' },
    { x: 6, y: 32, width: 27, height: 4, tone: 'solid' },
    { x: 6, y: 38, width: 20, height: 3, tone: 'muted' },
    { x: 36.5, y: 6, width: 27, height: 24, tone: 'muted' },
    { x: 36.5, y: 32, width: 27, height: 4, tone: 'solid' },
    { x: 36.5, y: 38, width: 20, height: 3, tone: 'muted' },
    { x: 67, y: 6, width: 27, height: 24, tone: 'muted' },
    { x: 67, y: 32, width: 27, height: 4, tone: 'solid' },
  ],
  FeaturedProducts: [
    { x: 6, y: 4, width: 40, height: 20, tone: 'muted' },
    { x: 6, y: 25, width: 40, height: 5, tone: 'accent' },
    { x: 54, y: 4, width: 40, height: 20, tone: 'muted' },
    { x: 54, y: 25, width: 40, height: 5, tone: 'accent' },
    { x: 6, y: 32, width: 40, height: 20, tone: 'muted' },
    { x: 6, y: 53, width: 40, height: 5, tone: 'accent' },
    { x: 54, y: 32, width: 40, height: 20, tone: 'muted' },
    { x: 54, y: 53, width: 40, height: 5, tone: 'accent' },
  ],
};

const DEFAULT_THUMBNAIL: readonly ThumbnailRect[] = [
  { x: 8, y: 10, width: 84, height: 8, tone: 'solid' },
  { x: 8, y: 24, width: 84, height: 26, tone: 'muted' },
];

export const blockThumbnailRects = (type: string): readonly ThumbnailRect[] =>
  BLOCK_THUMBNAILS[type] ?? DEFAULT_THUMBNAIL;
