export interface BlockCatalogEntry {
  readonly type: string;
  readonly label: string;
  readonly description: string;
}

// Los 11 tipos de `COMPONENT_MAP` (src/modules/Page/presentation/componentMap.ts), en
// español y con una frase de para qué sirve cada uno, para el catálogo de "agregar bloque".
export const BLOCK_CATALOG: readonly BlockCatalogEntry[] = [
  {
    type: 'Hero',
    label: 'Portada',
    description:
      'Bloque grande de bienvenida con título, imagen de fondo y botones de acción.',
  },
  {
    type: 'Features',
    label: 'Características',
    description:
      'Grilla de tarjetas con ícono, título y descripción para listar cualidades.',
  },
  {
    type: 'CallToAction',
    label: 'Llamado a la acción',
    description: 'Franja con un mensaje corto y un botón destacado hacia otra página.',
  },
  {
    type: 'TextBlock',
    label: 'Texto',
    description: 'Párrafo de contenido libre, opcionalmente con una imagen al costado.',
  },
  {
    type: 'ContactForm',
    label: 'Formulario de contacto',
    description:
      'Formulario de contacto con datos de la empresa (teléfono, WhatsApp, horario).',
  },
  {
    type: 'Stats',
    label: 'Cifras',
    description:
      'Números destacados en fila (ej. años de experiencia, clientes atendidos).',
  },
  {
    type: 'ServiceCards',
    label: 'Tarjetas de servicios',
    description:
      'Grilla de servicios con ícono, lista de puntos y enlace a más información.',
  },
  {
    type: 'SplitHighlights',
    label: 'Lista con imagen',
    description: 'Lista de puntos destacados junto a una foto lateral.',
  },
  {
    type: 'Testimonials',
    label: 'Testimonios',
    description: 'Carrusel de citas de clientes con calificación en estrellas.',
  },
  {
    type: 'LocationMap',
    label: 'Ubicación',
    description: 'Dirección con enlace a Google Maps.',
  },
  {
    type: 'Columns',
    label: 'Columnas',
    description:
      'De 1 a 4 columnas, cada una con foto y/o texto, para pasos o comparaciones.',
  },
  {
    type: 'Faq',
    label: 'Preguntas frecuentes',
    description:
      'Preguntas que se despliegan al tocarlas. Resuelve dudas sin alargar la página.',
  },
  {
    type: 'Pricing',
    label: 'Planes y precios',
    description:
      'Tarjetas comparativas con lista de características y un plan destacado.',
  },
  {
    type: 'Gallery',
    label: 'Galería de imágenes',
    description: 'Grilla o mosaico de fotos, con vista ampliada al tocar una.',
  },
  {
    type: 'LogoCloud',
    label: 'Logos de clientes',
    description: 'Fila de logos o cinta en movimiento, para mostrar con quién trabajan.',
  },
  {
    type: 'Team',
    label: 'Equipo',
    description: 'Fotos, nombres, cargos y redes de las personas detrás del negocio.',
  },
  {
    type: 'Timeline',
    label: 'Proceso o línea de tiempo',
    description: 'Pasos numerados o hitos con fecha, para explicar cómo se trabaja.',
  },
  {
    type: 'Video',
    label: 'Video',
    description: 'Video de YouTube, Vimeo o propio, con portada y carga diferida.',
  },
  {
    type: 'AnnouncementBar',
    label: 'Barra de anuncio',
    description: 'Franja con un mensaje breve y un enlace, por ejemplo una promoción.',
  },
  {
    type: 'BeforeAfter',
    label: 'Antes y después',
    description: 'Comparador deslizable entre dos imágenes, para mostrar un resultado.',
  },
  {
    type: 'OpeningHours',
    label: 'Horarios de atención',
    description: 'Días y horarios, indicando si el negocio está abierto en este momento.',
  },
  {
    type: 'Newsletter',
    label: 'Suscripción a novedades',
    description: 'Captura de correo con mensaje de confirmación.',
  },
  {
    type: 'GoogleReviews',
    label: 'Reseñas de Google',
    description: 'Calificación general y reseñas destacadas del negocio.',
  },
  {
    type: 'LatestPosts',
    label: 'Últimas publicaciones',
    description: 'Últimas entradas del blog del sitio, en tarjetas o en lista.',
  },
];

export const findBlockCatalogEntry = (type: string): BlockCatalogEntry | undefined =>
  BLOCK_CATALOG.find((entry) => entry.type === type);
