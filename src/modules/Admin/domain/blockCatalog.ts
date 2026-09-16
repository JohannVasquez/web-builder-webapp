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
];

export const findBlockCatalogEntry = (type: string): BlockCatalogEntry | undefined =>
  BLOCK_CATALOG.find((entry) => entry.type === type);
